/**
 * Client logos.
 *
 * DELIBERATELY EMPTY. Logos may only be shown if they already appear on the
 * live site's Clientele page, and that page was unreachable from the build
 * environment (egress policy — see CONTENT-TODO.md). No logo is invented, and
 * Section 16 bans a "trusted by" bar built from placeholder marks.
 *
 * scripts/fetch-assets.sh downloads the logo set from the live site. Once it
 * has run, populate this array from what actually landed in
 * public/assets/clients/ — the ClientWall renders from here and nothing else.
 *
 * The wall renders nothing at all while this array is empty. It does not fall
 * back to grey boxes, and the "300+ customers" caption still carries the point
 * on its own.
 */

export type Client = {
  /** Display name, used as the logo's alt text. */
  readonly name: string;
  readonly logo: string;
};

export const clients: readonly Client[] = [];

/**
 * Filenames referenced on the live site, for whoever populates the array
 * above. Presence of a file is not confirmation that the company is a
 * current customer — check before publishing.
 */
export const KNOWN_CLIENT_LOGO_FILES = [
  "vita",
  "rajhans",
  "RAINBOW",
  "DICE",
  "AZIMUT",
] as const;
