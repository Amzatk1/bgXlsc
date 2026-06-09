import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import http from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const kitRoot = path.join(root, "claude-relume-lsc-kit");
const sourceAssets = path.join(root, "public", "assets", "lgssnkrclub");
const sourceJson = path.join(root, "reference", "lgssnkrclub.json");

const imageMap = [
  ["logo.jpg", "assets/logo/lsc-profile-logo.jpg", "Profile logo from Instagram"],
  ["post-01.jpg", "assets/images/brand/01-calling-african-brands.jpg", "Dark LSC store poster: Calling African Brands"],
  ["post-03.jpg", "assets/images/brand/02-open-everyday.jpg", "Dark LSC store poster: Open Everyday"],
  ["post-02.jpg", "assets/images/events/01-partner-with-us.jpg", "Red event partnership poster"],
  ["post-04.jpg", "assets/images/events/02-rasta-roast-community.jpg", "Community gathering and food event"],
  ["post-09.jpg", "assets/images/events/03-sneaker-saturday-winners.jpg", "Sneaker Saturday winners"],
  ["post-08.jpg", "assets/images/products/01-lavcore-denim-crocs.jpg", "Lavcore denim crocs product/editorial image"],
  ["post-05.jpg", "assets/images/products/02-whats-in-my-lsc-bag.jpg", "LSC bag contents and cross-sell image"],
  ["post-07.jpg", "assets/images/products/03-1k-sneaker-saturday-fit.jpg", "Sneaker Saturday product/event thumbnail"],
  ["post-10.jpg", "assets/images/products/04-culture-fit.jpg", "Lifestyle fit thumbnail"],
  ["post-11.jpg", "assets/images/products/05-clue-4.jpg", "Campaign clue poster/video thumbnail"],
  ["post-12.jpg", "assets/images/products/06-clue-3.jpg", "Campaign clue poster/video thumbnail"],
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function cleanCaption(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function sanitizeLscOnlyCaption(text = "") {
  return cleanCaption(text)
    .replace(/@?bearded[_\s-]?genius/gi, "LSC")
    .replace(/#thebeardedgeniusway/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasExcludedBrand(text = "") {
  return /bearded[_\s-]?genius/i.test(text) || /thebeardedgeniusway/i.test(text);
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);
}

function mediaEdges(user) {
  return [
    ...(user.edge_owner_to_timeline_media?.edges ?? []),
    ...(user.edge_felix_video_timeline?.edges ?? []),
  ];
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
        download(new URL(response.headers.location, url).toString(), outputPath, redirects + 1).then(
          resolve,
          reject,
        );
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      ensureDir(outputPath);
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
  fs.mkdirSync(kitRoot, { recursive: true });
  fs.rmSync(path.join(kitRoot, "assets"), { recursive: true, force: true });

  const manifest = {
    createdFor: "Claude + Relume handoff",
    brand: "Lagos Sneaker Club",
    source: "Public Instagram data downloaded from @lgssnkrclub",
    images: [],
    videos: [],
  };

  for (const [from, to, usage] of imageMap) {
    const source = path.join(sourceAssets, from);
    const destination = path.join(kitRoot, to);
    ensureDir(destination);
    fs.copyFileSync(source, destination);
    manifest.images.push({ path: to, usage });
  }

  const json = JSON.parse(fs.readFileSync(sourceJson, "utf8"));
  const user = json.data.user;
  const videoNodes = mediaEdges(user)
    .map((edge) => edge.node)
    .filter((node) => {
      const rawCaption = cleanCaption(node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "");
      return node.is_video && node.video_url && !hasExcludedBrand(rawCaption);
    })
    .slice(0, 4);

  for (const [index, node] of videoNodes.entries()) {
    const caption = sanitizeLscOnlyCaption(
      node.edge_media_to_caption?.edges?.[0]?.node?.text ?? node.shortcode,
    );
    const name = `${String(index + 1).padStart(2, "0")}-${slug(caption || node.shortcode)}.mp4`;
    const relativePath = `assets/videos/${name}`;
    await download(node.video_url, path.join(kitRoot, relativePath));
    manifest.videos.push({
      path: relativePath,
      shortcode: node.shortcode,
      caption,
      usage: index === 0 ? "Homepage motion teaser / culture reel" : "Slideshow or community section clip",
      instagramUrl: `https://www.instagram.com/p/${node.shortcode}/`,
    });
  }

  fs.writeFileSync(path.join(kitRoot, "asset-manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(kitRoot, "ASSET_MANIFEST.md"),
    [
      "# Lagos Sneaker Club Asset Manifest",
      "",
      "Use these local files when prompting Claude/Relume. Avoid Bearded Genius assets.",
      "",
      "## Images",
      ...manifest.images.map((item) => `- \`${item.path}\` - ${item.usage}`),
      "",
      "## Videos",
      ...manifest.videos.map((item) => `- \`${item.path}\` - ${item.usage} (${item.shortcode})`),
      "",
    ].join("\n"),
  );

  console.log(`Created LSC Relume kit at ${kitRoot}`);
  console.log(`${manifest.images.length} images, ${manifest.videos.length} videos`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
