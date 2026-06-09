import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

/**
 * Set your project id + dataset via env (SANITY_STUDIO_PROJECT_ID / _DATASET),
 * or replace the fallbacks below. `npm create sanity@latest` will fill these in.
 */
export default defineConfig({
  name: "lsc",
  title: "Lagos Sneaker Club",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "REPLACE_WITH_PROJECT_ID",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
