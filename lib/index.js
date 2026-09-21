/**
 * dsh-settings-size — host half.
 *
 * The host side is intentionally a no-op loader entry: the whole feature
 * lives in the browser half (`./client`), which DSH's dsh-client-modules
 * picks up through the package's `dsh.client` declaration — the same shape
 * as the shipped ui-* packages.
 *
 * The chosen size is persisted in localStorage rather than through the Host
 * settings wire: that wire only exposes an allowlisted set of namespaces to
 * browser clients (dsh-host-apiproxy's WEB_SETTINGS_NAMESPACES), so a
 * third-party namespace would answer `settings-not-exposed`. A dialog size is
 * a per-browser visual preference, and the product itself keeps remote
 * browser preferences process-local — localStorage matches that boundary
 * while surviving reloads on the same origin.
 */

/** Host loader entry for the browser implementation exported from `./client`. */
export function apply() {}
