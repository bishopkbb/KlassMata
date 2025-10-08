// lib/utils.ts

/**
 * Merge Tailwind classes conditionally.
 * Usage: cn("base-class", isActive && "bg-blue-500")
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format a date nicely.
 */
export function formatDate(date: Date | string, locale = "en-NG") {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)
}

/**
 * Generate a random string (useful for IDs, tokens, etc.)
 */
export function randomString(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}
