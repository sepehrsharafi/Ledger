/**
 * Colours for data marks — chart lines, channel bars, avatars. These are
 * deliberately a separate, desaturated scale from the interface accent: the
 * accent means "this is actionable", so charts must not borrow it, or every
 * series starts looking like a button.
 *
 * Interface colours live in app/globals.css as `--color-*` tokens; use those
 * (via Tailwind utilities) for anything that is chrome rather than data.
 */

export const SERIES = {
  ink: "#1a1a18",
  deep: "#3c5c86",
  mid: "#5c7aa8",
  light: "#93b4d8",
  pale: "#c9c8c2",
  faint: "#d8d7d1",
};

/** Default fill behind initials when a record carries no colour of its own. */
export const AVATAR_FILL = "#26251f";

/** Marketing channels, ordered darkest to lightest for legibility when stacked. */
export const CHANNEL_COLORS = {
  Search: SERIES.ink,
  Social: SERIES.deep,
  Email: SERIES.light,
  Paid: SERIES.pale,
};

/** Ordered ramp for the attributed-channel breakdown, which is share-sorted. */
export const CHANNEL_RAMP = [SERIES.mid, SERIES.ink, SERIES.light, SERIES.faint];
