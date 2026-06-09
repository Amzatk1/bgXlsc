import { defineField, defineType } from "sanity";

export default defineType({
  name: "mediaItem",
  title: "Video / Media",
  type: "document",
  fields: [
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "title",
      title: "Title / label",
      type: "string",
      description: "Shown as the caption on the tile / slide.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "mediaType",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "image",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "placement",
      title: "Where it appears",
      type: "string",
      options: {
        list: [
          { title: "Homepage slideshow (hero)", value: "slideshow" },
          { title: "Media rail (feed wall)", value: "rail" },
        ],
        layout: "radio",
      },
      initialValue: "rail",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== "image",
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "video",
      title: "Video file (mp4)",
      type: "file",
      options: { accept: "video/mp4" },
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({
      name: "externalUrl",
      title: "External media URL (optional)",
      type: "url",
      description: "Use instead of an upload if the file is hosted elsewhere.",
    }),
    defineField({
      name: "poster",
      title: "Poster image (for video)",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
    defineField({
      name: "link",
      title: "Links to (optional)",
      type: "url",
      description: "e.g. the Instagram post. Defaults to the LSC Instagram.",
    }),
    defineField({
      name: "duration",
      title: "Slide duration (ms, image slides only)",
      type: "number",
      initialValue: 6000,
      hidden: ({ parent }) => parent?.placement !== "slideshow" || parent?.mediaType !== "image",
    }),
    defineField({
      name: "soundAllowed",
      title: "Allow sound control",
      type: "boolean",
      initialValue: true,
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
  orderings: [
    { title: "Sort order", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", placement: "placement", type: "mediaType", media: "image", poster: "poster" },
    prepare: ({ title, placement, type, media, poster }) => ({
      title: title ?? "Untitled",
      subtitle: `${type ?? ""} · ${placement ?? ""}`,
      media: media ?? poster,
    }),
  },
});
