import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "main", title: "Details", default: true },
    { name: "stock", title: "Sizes & price" },
    { name: "media", title: "Media" },
    { name: "meta", title: "Display" },
  ],
  fields: [
    defineField({
      name: "published",
      title: "Published (visible on the website)",
      type: "boolean",
      initialValue: true,
      group: "main",
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
      group: "main",
      options: {
        list: ["Nike", "New Balance", "Adidas", "Asics", "Converse", "Lavcore"],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "model",
      title: "Model",
      type: "string",
      description: 'e.g. "Dunk Low Retro", "Air Force 1 \'07"',
      group: "main",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "colorway",
      title: "Colorway",
      type: "string",
      description: 'e.g. "Panda — Black/White". Colour words drive the placeholder swatches.',
      group: "main",
    }),
    defineField({
      name: "slug",
      title: "Slug (URL id)",
      type: "slug",
      options: { source: (doc) => `${doc.model ?? ""} ${doc.colorway ?? ""}`, maxLength: 96 },
      group: "main",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["Sneakers", "Accessories"], layout: "radio" },
      initialValue: "Sneakers",
      group: "main",
    }),
    defineField({
      name: "silhouette",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Low-top", value: "low" },
          { title: "Runner", value: "runner" },
          { title: "High-top", value: "high" },
          { title: "Court", value: "court" },
          { title: "Clog", value: "clog" },
        ],
      },
      initialValue: "low",
      group: "main",
    }),
    defineField({
      name: "condition",
      title: "Condition",
      type: "string",
      options: { list: ["New", "Consignment", "Used", "Custom"] },
      initialValue: "New",
      group: "main",
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      options: {
        list: [
          { title: "In store", value: "in-store" },
          { title: "Low stock", value: "low" },
          { title: "By request", value: "request" },
        ],
        layout: "radio",
      },
      initialValue: "in-store",
      group: "main",
    }),

    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      group: "stock",
      of: [
        {
          type: "object",
          fields: [
            { name: "size", title: "Size", type: "string" },
            { name: "available", title: "Available", type: "boolean", initialValue: true },
            { name: "soldOut", title: "Sold out", type: "boolean", initialValue: false },
          ],
          preview: {
            select: { title: "size", available: "available", soldOut: "soldOut" },
            prepare: ({ title, soldOut }) => ({
              title: title ?? "—",
              subtitle: soldOut ? "Sold out" : "Available",
            }),
          },
        },
      ],
    }),
    defineField({
      name: "priceMode",
      title: "Price display",
      type: "string",
      group: "stock",
      options: {
        list: [
          { title: "Confirm on WhatsApp (recommended)", value: "whatsapp" },
          { title: "Show fixed price", value: "fixed" },
          { title: "Hide price", value: "hidden" },
        ],
        layout: "radio",
      },
      initialValue: "whatsapp",
    }),
    defineField({
      name: "price",
      title: "Price (₦)",
      type: "number",
      group: "stock",
      description: "Only used when Price display is 'Show fixed price'.",
      hidden: ({ parent }) => parent?.priceMode !== "fixed",
      validation: (r) =>
        r.custom((value, ctx) => {
          const mode = (ctx.parent as { priceMode?: string })?.priceMode;
          if (mode === "fixed" && (value === undefined || value === null))
            return "Set a price, or change Price display.";
          return true;
        }),
    }),

    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt text (describe the photo)",
              type: "string",
              validation: (r) => r.required(),
            },
          ],
        },
      ],
      description: "First photo is the card image. Leave empty to use an editorial placeholder tile.",
    }),
    defineField({
      name: "video",
      title: "Video (optional)",
      type: "file",
      group: "media",
      options: { accept: "video/mp4" },
    }),

    defineField({
      name: "tag",
      title: "Badge",
      type: "string",
      group: "meta",
      options: {
        list: ["New drop", "Core", "Consignment", "Made in Lagos", "Restock"],
      },
    }),
    defineField({
      name: "featured",
      title: "Show on homepage (Featured drops)",
      type: "boolean",
      initialValue: false,
      group: "meta",
    }),
    defineField({
      name: "origin",
      title: "Origin note",
      type: "string",
      description: 'e.g. "Nigerian-made · custom"',
      group: "meta",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order (lower shows first)",
      type: "number",
      group: "meta",
    }),
  ],
  orderings: [
    { title: "Sort order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] },
    { title: "Newest", name: "newest", by: [{ field: "_createdAt", direction: "desc" }] },
  ],
  preview: {
    select: { brand: "brand", model: "model", colorway: "colorway", media: "images.0", published: "published" },
    prepare: ({ brand, model, colorway, media, published }) => ({
      title: `${brand ?? ""} ${model ?? ""}`.trim() || "Untitled product",
      subtitle: `${colorway ?? ""}${published === false ? " · Hidden" : ""}`,
      media,
    }),
  },
});
