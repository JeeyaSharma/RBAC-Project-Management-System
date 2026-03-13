const PUBLIC_ID_PREFIX = "USR-";
const PUBLIC_ID_LENGTH = 10;

const toPublicUserId = (userId) => {
  if (!userId) return null;

  return `${PUBLIC_ID_PREFIX}${String(userId)
    .replace(/-/g, "")
    .toUpperCase()
    .slice(0, PUBLIC_ID_LENGTH)}`;
};

const isPublicUserId = (value) =>
  typeof value === "string" &&
  new RegExp(`^${PUBLIC_ID_PREFIX}[A-F0-9]{${PUBLIC_ID_LENGTH}}$`, "i").test(value);

module.exports = {
  PUBLIC_ID_PREFIX,
  PUBLIC_ID_LENGTH,
  toPublicUserId,
  isPublicUserId
};