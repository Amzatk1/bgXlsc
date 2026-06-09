import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import http from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const brands = [
  {
    key: "lgssnkrclub",
    json: "lgssnkrclub.json",
    assetDir: "lgssnkrclub",
    displayName: "Lagos Sneaker Club",
  },
];

function cleanCaption(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function hasExcludedBrand(text = "") {
  return /bearded[_\s-]?genius/i.test(text) || /thebeardedgeniusway/i.test(text);
}

function mediaEdges(user) {
  return [
    ...(user.edge_owner_to_timeline_media?.edges ?? []),
    ...(user.edge_felix_video_timeline?.edges ?? []),
  ];
}

function selectImageUrl(node) {
  const resources = node.thumbnail_resources ?? [];
  const largest = resources[resources.length - 1]?.src;
  return node.display_url || node.thumbnail_tall_src || node.thumbnail_src || largest;
}

function extensionFromUrl(url) {
  const clean = new URL(url).pathname;
  const ext = path.extname(clean).toLowerCase();
  return ext && ext.length <= 5 ? ext : ".jpg";
}

function download(url, outputPath, redirects = 0) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("http:") ? http : https;
    const request = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume();
        if (redirects > 5) {
          reject(new Error(`Too many redirects for ${url}`));
          return;
        }
        const nextUrl = new URL(response.headers.location, url).toString();
        download(nextUrl, outputPath, redirects + 1).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    });

    request.setTimeout(30000, () => {
      request.destroy(new Error(`Timeout downloading ${url}`));
    });
    request.on("error", reject);
  });
}

async function run() {
  const manifest = {};

  for (const brand of brands) {
    const sourcePath = path.join(root, "reference", brand.json);
    const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    const user = data.data.user;
    const outputDir = path.join(root, "public", "assets", brand.assetDir);
    fs.mkdirSync(outputDir, { recursive: true });

    const logoUrl = user.profile_pic_url_hd || user.profile_pic_url;
    const logoPath = path.join(outputDir, `logo${extensionFromUrl(logoUrl)}`);
    await download(logoUrl, logoPath);

    const posts = [];
    const seen = new Set();
    const edges = mediaEdges(user);

    for (const edge of edges) {
      const node = edge.node;
      if (seen.has(node.shortcode)) continue;
      seen.add(node.shortcode);

      const url = selectImageUrl(node);
      if (!url) continue;

      const caption = cleanCaption(node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "");
      if (hasExcludedBrand(caption)) continue;

      const index = posts.length + 1;
      const fileName = `post-${String(index).padStart(2, "0")}${extensionFromUrl(url)}`;
      const outputPath = path.join(outputDir, fileName);
      await download(url, outputPath);

      posts.push({
        shortcode: node.shortcode,
        type: node.__typename,
        isVideo: Boolean(node.is_video),
        width: node.dimensions?.width ?? null,
        height: node.dimensions?.height ?? null,
        caption,
        image: `/assets/${brand.assetDir}/${fileName}`,
        instagramUrl: `https://www.instagram.com/p/${node.shortcode}/`,
      });

      if (posts.length >= 12) break;
    }

    manifest[brand.key] = {
      displayName: brand.displayName,
      instagram: `https://www.instagram.com/${brand.key}/`,
      username: user.username,
      fullName: user.full_name,
      biography: user.biography,
      category: user.category_name,
      followers: user.edge_followed_by?.count ?? 0,
      following: user.edge_follow?.count ?? 0,
      postsCount: user.edge_owner_to_timeline_media?.count ?? 0,
      logo: `/assets/${brand.assetDir}/${path.basename(logoPath)}`,
      bioLinks: (user.bio_links ?? []).map((link) => ({
        title: link.title,
        url: link.url,
        type: link.link_type,
      })),
      posts,
    };
  }

  const manifestPath = path.join(root, "src", "data");
  fs.mkdirSync(manifestPath, { recursive: true });
  fs.writeFileSync(
    path.join(manifestPath, "instagram-assets.json"),
    JSON.stringify(manifest, null, 2),
  );

  console.log(
    Object.values(manifest)
      .map((brand) => `${brand.displayName}: logo + ${brand.posts.length} media images`)
      .join("\n"),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
