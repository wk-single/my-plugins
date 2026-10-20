/**
 * Host half of the startup splash bundle.
 *
 * The animation lives entirely in the Client half (`./client.js`), which
 * registers a full-screen entry into the `shell.overlay` slot. No Host service
 * or event is involved, so this side only contributes the Loader row.
 */
export function apply() {}
