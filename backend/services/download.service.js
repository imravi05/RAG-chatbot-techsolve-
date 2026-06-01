import fs from "fs";
import path from "path";
import YTDlpWrap from "yt-dlp-wrap";

const ytDlpWrap = new YTDlpWrap.default();

export const downloadAudio = async (url, outputName) => {

  const downloadsDir = path.resolve("downloads");

  const outputTemplate = path.join(
    downloadsDir,
    `${outputName}.%(ext)s`
  );

  await ytDlpWrap.execPromise([
    url,
    "-f",
    "bestaudio",
    "-o",
    outputTemplate
  ]);

  const files = fs.readdirSync(downloadsDir);

  const downloadedFile = files.find(
    file => file.startsWith(outputName)
  );

  if (!downloadedFile) {
    throw new Error(
      `Downloaded file not found for ${outputName}`
    );
  }

  return path.join(
    downloadsDir,
    downloadedFile
  );
};