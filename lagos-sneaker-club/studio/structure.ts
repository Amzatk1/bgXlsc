import type { StructureResolver } from "sanity/structure";

/** Editor-friendly desk: Store settings (single doc) + Products / Media / Events. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Lagos Sneaker Club")
    .items([
      S.listItem()
        .title("Store settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("product").title("Products"),
      S.documentTypeListItem("mediaItem").title("Videos & media"),
      S.documentTypeListItem("event").title("Events"),
    ]);
