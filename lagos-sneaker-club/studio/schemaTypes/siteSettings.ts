import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Store settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact & location", default: true },
    { name: "hours", title: "Hours" },
    { name: "site", title: "Site" },
  ],
  fields: [
    defineField({
      name: "whatsapp",
      title: "WhatsApp number (digits only, with country code)",
      type: "string",
      description: 'e.g. "2349130023762" — used for every WhatsApp link.',
      group: "contact",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "whatsappDisplay",
      title: "WhatsApp number (shown)",
      type: "string",
      description: 'e.g. "+234 913 002 3762"',
      group: "contact",
    }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url", group: "contact" }),
    defineField({ name: "instagramHandle", title: "Instagram handle", type: "string", group: "contact" }),
    defineField({ name: "addressStreet", title: "Street", type: "string", group: "contact" }),
    defineField({ name: "addressRegion", title: "Region / postcode", type: "string", group: "contact" }),
    defineField({ name: "addressFull", title: "Full address (shown)", type: "string", group: "contact" }),
    defineField({ name: "mapEmbed", title: "Map embed URL", type: "url", group: "contact" }),
    defineField({ name: "mapsDirections", title: "Directions URL", type: "url", group: "contact" }),

    defineField({
      name: "hoursSummary",
      title: "Hours summary (shown)",
      type: "string",
      description: 'e.g. "Mon–Sat 12–6pm · Sun 12–4pm"',
      group: "hours",
    }),
    defineField({
      name: "hours",
      title: "Opening hours",
      type: "array",
      group: "hours",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "dow",
              title: "Day of week (0=Sun … 6=Sat)",
              type: "number",
              validation: (r) => r.min(0).max(6),
            },
            { name: "day", title: "Day label", type: "string" },
            { name: "time", title: "Time", type: "string", description: 'e.g. "12:00 – 18:00"' },
          ],
          preview: {
            select: { title: "day", subtitle: "time" },
          },
        },
      ],
    }),

    defineField({
      name: "announcement",
      title: "Announcement bar text (optional)",
      type: "string",
      description: "Leave empty to auto-show open/closed status.",
      group: "site",
    }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string", group: "site" }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 2,
      group: "site",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Store settings" }),
  },
});
