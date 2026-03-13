const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toPublicUserId(value?: string | null): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (trimmed.toUpperCase().startsWith("USR-")) {
    return trimmed.toUpperCase();
  }

  if (UUID_REGEX.test(trimmed)) {
    return `USR-${trimmed.replace(/-/g, "").toUpperCase().slice(0, 10)}`;
  }

  return trimmed;
}