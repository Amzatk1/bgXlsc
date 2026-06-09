import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "published", title: "Published", type: "boolean", initialValue: true }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      description: 'e.g. "Flagship meet-up", "Dinner series", "Pop-up"',
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      options: { dateFormat: "DD MMM YYYY" },
    }),
    defineField({
      name: "when",
      title: "When (label)",
      type: "string",
      description: 'e.g. "Monthly · Saturday", "Quarterly"',
    }),
    defineField({ name: "time", title: "Time", type: "string", description: 'e.g. "2pm – 6pm"' }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "media",
      title: "Image / video",
      type: "object",
      fields: [
        {
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
        },
        {
          name: "image",
          title: "Image",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
        { name: "video", title: "Video (mp4)", type: "file", options: { accept: "video/mp4" } },
        { name: "externalUrl", title: "External media URL", type: "url" },
        { name: "poster", title: "Poster (for video)", type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "tag",
      title: "Badge",
      type: "string",
      description: 'e.g. "Flagship", "Community", "Pop-up"',
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
  orderings: [{ title: "Date", name: "date", by: [{ field: "date", direction: "asc" }] }],
  preview: {
    select: { title: "title", date: "date", media: "media.image" },
    prepare: ({ title, date, media }) => ({
      title: title ?? "Untitled event",
      subtitle: date ?? "",
      media,
    }),
  },
});
