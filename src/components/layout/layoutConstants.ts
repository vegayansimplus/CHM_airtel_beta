/**
 * Single source of truth for the shell's sidebar widths — Header and
 * SideBar both read from here instead of each hardcoding the same pixel
 * values (previously duplicated by convention between the two files).
 */
export const DRAWER_WIDTH = 240;
export const COLLAPSED_WIDTH = 70;

/** Left padding the header reserves on mobile, where the sidebar is an
 * overlay (temporary) drawer rather than a permanent rail — just enough
 * room for the hamburger toggle, not a full rail width. */
export const MOBILE_HEADER_INSET = 60;
