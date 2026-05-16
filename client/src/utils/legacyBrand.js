const replacements = [
  [/COCIN Academy Abuja/g, "Rehoboth Prime Years"],
  [/COCIN Academy/g, "Rehoboth Prime Years"],
  [/COCIN Church/g, "School"],
  [/cocinacademy07@gmail\.com/g, "info@rehobothprimeyears.edu.ng"],
  [/cocinacademyabuja\.com/g, "rehobothprimeyears.edu.ng"],
  [/cocinacademy/g, "rehobothprimeyears"],
  [/cocin_academy/g, "rehoboth_prime_years"]
];

function normalizeString(value) {
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

export function normalizeLegacyBrand(value) {
  if (typeof value === "string") return normalizeString(value);
  if (Array.isArray(value)) return value.map(normalizeLegacyBrand);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nextValue]) => [key, normalizeLegacyBrand(nextValue)])
  );
}
