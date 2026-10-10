import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática (carpeta out/): HTML de cada página, sin servidor. Se sube a Firebase Hosting
  output: "export",
  // Sin servidor no se optimizan imágenes al vuelo (las capturas ya van reducidas a 540 px)
  images: { unoptimized: true },
  // URLs con barra final (/docs/ → /docs/index.html): así Firebase Hosting las sirve sin reglas extra
  trailingSlash: true,
  turbopack: {
    // La web es su propio proyecto (la librería, en la carpeta de arriba, tiene otro lockfile)
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
