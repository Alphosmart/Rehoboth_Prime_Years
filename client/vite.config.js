import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const galleryModuleId = "virtual:category-gallery";
const resolvedGalleryModuleId = `\0${galleryModuleId}`;
const imageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

function collectGalleryImages(directory, root = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) return collectGalleryImages(absolutePath, root);
    if (!imageExtensions.has(extname(entry.name).toLowerCase())) return [];

    const relativePath = relative(root, absolutePath).split(sep).join("/");
    const publicPath = `/gallery/categories/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
    return [{ relativePath, image: publicPath }];
  });
}

function categoryGalleryPlugin() {
  return {
    name: "category-gallery",
    resolveId(id) {
      return id === galleryModuleId ? resolvedGalleryModuleId : null;
    },
    load(id) {
      if (id !== resolvedGalleryModuleId) return null;
      const images = collectGalleryImages(join(process.cwd(), "public/gallery/categories"));
      return `export default ${JSON.stringify(images)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), categoryGalleryPlugin()],
  server: { port: 5173 }
});
