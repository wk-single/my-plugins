#!/usr/bin/env node
/**
 * Validate every directory under packages/ as an installable DSH bundle.
 *
 * Checks the manifest, exports, Loader patch, locale metadata, icon limits and
 * the client factory id. Run locally with `npm run validate`; CI runs the same
 * script, so a green run here means the repository is structurally sound.
 */

import { readdir, readFile, access, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packagesDir = join(root, 'packages');
const MAX_ICON_BYTES = 256 * 1024;

const problems = [];
const fail = (pkg, message) => problems.push(`${pkg}: ${message}`);

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (pkg, path) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(pkg, `invalid JSON in ${relative(root, path)}: ${error.message}`);
    return null;
  }
};

const entries = await readdir(packagesDir, { withFileTypes: true });
const dirNames = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (dirNames.length === 0) {
  fail('packages', 'no packages found');
}

const results = [];

for (const dirName of dirNames) {
  const dir = join(packagesDir, dirName);
  const pkg = dirName;
  const manifestPath = join(dir, 'package.json');

  if (!(await exists(manifestPath))) {
    fail(pkg, 'missing package.json');
    continue;
  }

  const manifest = await readJson(pkg, manifestPath);
  if (!manifest) continue;

  if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
    fail(pkg, 'package.json: missing "name"');
  }
  if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    fail(pkg, 'package.json: "version" must be SemVer');
  }
  if (typeof manifest.license !== 'string' || manifest.license.length === 0) {
    fail(pkg, 'package.json: missing "license"');
  }

  const exportsMap = manifest.exports ?? {};
  if (!exportsMap['.']) fail(pkg, 'package.json: missing "." export');

  const clientExport = exportsMap['./client'];
  const clientPath = typeof clientExport === 'string'
    ? clientExport
    : clientExport && typeof clientExport.default === 'string'
      ? clientExport.default
      : null;
  if (!clientPath) {
    fail(pkg, 'package.json: missing "./client" export');
  } else if (!(await exists(join(dir, clientPath)))) {
    fail(pkg, `./client target not found: ${clientPath}`);
  }

  const patch = manifest.dsh?.bundle?.patch;
  if (typeof patch !== 'string' || patch.length === 0) {
    fail(pkg, 'package.json: missing dsh.bundle.patch');
  } else if (!(await exists(join(dir, patch)))) {
    fail(pkg, `dsh.bundle.patch target not found: ${patch}`);
  } else {
    const patchText = await readFile(join(dir, patch), 'utf8');
    if (!patchText.includes(manifest.name)) {
      fail(pkg, `${patch} does not reference "${manifest.name}"`);
    }
  }

  const client = manifest.dsh?.client;
  if (!client || typeof client !== 'object') {
    fail(pkg, 'package.json: missing dsh.client');
  } else {
    if (client.platform !== 'web') fail(pkg, 'dsh.client.platform must be "web"');
    if (!Array.isArray(client.inject)) fail(pkg, 'dsh.client.inject must be an array');
  }

  const files = manifest.files;
  if (!Array.isArray(files)) {
    fail(pkg, 'package.json: missing "files"');
  } else {
    const includes = (target) => files.some((entry) => entry.replace(/^\.\//, '') === target);
    if (typeof patch === 'string' && !includes(patch.replace(/^\.\//, ''))) {
      fail(pkg, `"files" must include ${patch}`);
    }
    if (!includes('client.js')) fail(pkg, '"files" must include client.js');
    if (!files.some((entry) => /(^|\/)icon\.(svg|png|jpe?g|webp)$/i.test(entry))) {
      fail(pkg, '"files" must include the icon');
    }
  }

  const iconEntry = exportsMap['./icon'];
  if (typeof iconEntry !== 'string') {
    fail(pkg, 'package.json: missing "./icon" export');
  } else {
    const iconPath = join(dir, iconEntry);
    if (!(await exists(iconPath))) {
      fail(pkg, `icon not found: ${iconEntry}`);
    } else {
      const info = await stat(iconPath);
      if (info.size === 0) fail(pkg, `icon is empty: ${iconEntry}`);
      if (info.size > MAX_ICON_BYTES) fail(pkg, `icon exceeds 256 KiB: ${info.size} bytes`);
    }
  }

  const localeDir = join(dir, 'locale');
  if (!(await exists(localeDir))) {
    fail(pkg, 'missing locale/ directory');
  } else {
    const localeFiles = (await readdir(localeDir)).filter((file) => file.endsWith('.json'));
    if (!localeFiles.includes('en.json')) fail(pkg, 'locale/en.json is required');
    for (const file of localeFiles) {
      const locale = await readJson(pkg, join(localeDir, file));
      if (!locale) continue;
      for (const field of ['title', 'description']) {
        const value = locale.meta && locale.meta[field];
        if (typeof value !== 'string' || value.length === 0) {
          fail(pkg, `locale/${file}: missing meta.${field}`);
        }
      }
    }
  }

  if (clientPath && (await exists(join(dir, clientPath)))) {
    const source = await readFile(join(dir, clientPath), 'utf8');
    const match = source.match(/__ModuleLoader__\.load\(\s*\{\s*id:\s*['"]([^'"]+)['"]/);
    if (!match) {
      fail(pkg, 'client bundle does not call __ModuleLoader__.load with an id');
    } else if (manifest.name && match[1] !== manifest.name) {
      fail(pkg, `factory id "${match[1]}" does not match package name "${manifest.name}"`);
    }
  }

  results.push(`${manifest.name}@${manifest.version}`);
}

if (problems.length > 0) {
  console.error('Validation failed:\n');
  for (const problem of problems) console.error(`  x ${problem}`);
  console.error(`\n${problems.length} problem(s) in ${dirNames.length} package(s).`);
  process.exit(1);
}

console.log(`Validated ${results.length} package(s):`);
for (const result of results) console.log(`  ok ${result}`);
