import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import YTDlpWrap from "yt-dlp-wrap";

const ytDlpWrap = new YTDlpWrap.default();

export const downloadAudio = async (url, outputName) => {

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const downloadsDir = path.join(__dirname, "..", "downloads");

  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const outputTemplate = path.join(
    downloadsDir,
    `${outputName}.%(ext)s`
  );

  try {
    await ytDlpWrap.execPromise([
      url,
      "-f",
      "bestaudio",
      "-o",
      outputTemplate
    ]);
  } catch (err) {
    throw new Error(`yt-dlp failed to download ${url}: ${err.message}`);
  }

  const files = fs.readdirSync(downloadsDir);

  // Match exactly "outputName.<ext>" so parallel downloads don't cross-match
  const downloadedFile = files.find(
    file => file === `${outputName}.${file.split(".").pop()}` &&
            file.startsWith(`${outputName}.`)
  );

  if (!downloadedFile) {
    throw new Error(
      `Downloaded file not found for "${outputName}" in ${downloadsDir}. ` +
      `Files present: [${files.join(", ")}]`
    );
  }

  return path.join(
    downloadsDir,
    downloadedFile
  );
};