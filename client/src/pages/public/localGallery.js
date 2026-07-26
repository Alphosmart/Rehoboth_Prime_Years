import categoryImages from "virtual:category-gallery";

const categoryCounts = new Map();
const featuredCategories = new Set(["Award Assembly", "Graduation 2026", "STEAM Week"]);

function formatCategory(folder) {
  return folder
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bCsr\b/, "CSR")
    .replace(/\bSteam\b/, "STEAM");
}

export const localGallery = categoryImages
  .map(({ relativePath, image }) => ({
    relativePath,
    category: formatCategory(relativePath.split("/")[0]),
    image,
  }))
  .sort((left, right) => left.relativePath.localeCompare(right.relativePath, undefined, { numeric: true }))
  .map(({ relativePath, category, image }) => {
    const photoNumber = (categoryCounts.get(category) || 0) + 1;
    categoryCounts.set(category, photoNumber);

    return {
      _id: `local-gallery-${relativePath}`,
      title: `${category} — Photo ${photoNumber}`,
      description: "",
      image,
      category,
      featured: photoNumber === 1 && featuredCategories.has(category),
    };
  });
