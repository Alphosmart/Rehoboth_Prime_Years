const replacements = [
  [/COCIN Academy Abuja/g, "Rehoboth Prime Years"],
  [/COCIN Academy/g, "Rehoboth Prime Years"],
  [/COCIN Church/g, "School"],
  [/cocinacademy07@gmail\.com/g, "rehobothprimeyears@gmail.com"],
  [/info@rehobothprimeyears\.edu\.ng/g, "rehobothprimeyears@gmail.com"],
  [/07046272361,\s*09018690022,\s*08180705629/g, "07034558581, 07015945362"],
  [/\+2347046272361/g, "+2347034558581"],
  [/900241 Cadastral Street,\s*Plot 5\/7 Durumi District,\s*Area 1,\s*F\.?C\.?T\.? Abuja/g, "Plot 115, Christine Nwuche Street Golden Spring Estate, Duboyi, FCT Abuja."],
  [/Growing in wisdom and favour(?! with God and Man)/g, "Growing in wisdom and favour with God and Man"],
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
