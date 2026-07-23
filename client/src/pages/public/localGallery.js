import hostedImages from "../../data/categoryGallery.json";

const categoryCounts = new Map();

export const localGallery = hostedImages
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
      featured: false,
    };
  });
