import YTDlpWrap from "yt-dlp-wrap";
import path from "path";


console.log(YTDlpWrap);
const ytDlpWrap = new YTDlpWrap.default();

export const downloadAudio = async (url, outputName) => {
  const outputPath = path.resolve(
    "downloads",
    `${outputName}.mp3`
  );

  await ytDlpWrap.execPromise([
  url,
  "-f",
  "bestaudio",
  "-o",
  outputPath
]);

  return outputPath;
};