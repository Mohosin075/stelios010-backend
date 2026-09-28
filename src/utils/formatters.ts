/**
 * Reusable formatting utilities for bridging DB Enums and Dashboard UI representation.
 */

// Extracts 2-letter uppercase initials from full name
export const getInitials = (name?: string | null): string => {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Deterministic avatar highlight (matches dashboard UI aesthetics)
export const getIsYellowAvatar = (name?: string | null): boolean => {
  if (!name) return false;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 2 === 0;
};

// Formats a Date to 'YYYY-MM-DD'
export const formatDate = (date?: Date | string | null): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toISOString().split("T")[0];
};

// Maps DB ENUM to Title Case / Space separated string
// e.g. ACTIVE_USER -> "Active User", UPPER_LIMB -> "Upper Limb", VERIFIED -> "Verified"
export const enumToUi = (val?: string | null): string => {
  if (!val) return "";
  return val
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Maps frontend input (with spaces or mixed case) to Postgres DB ENUM
// e.g. "Active User" -> "ACTIVE_USER", "Upper Limb" -> "UPPER_LIMB"
export const uiToEnum = (val?: string | null): string | undefined => {
  if (!val || val === "ALL" || val === "All") return undefined;
  return val.trim().toUpperCase().replace(/\s+/g, "_");
};
