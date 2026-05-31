import { exec } from "child_process";

export const getYoutubeMetadata = (url) => {
  return new Promise((resolve, reject) => {
    exec(
      `yt-dlp --dump-json "${url}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        const data = JSON.parse(stdout);

        resolve({
          platform: "youtube",
          title: data.title,
          creator: data.uploader,
          views: data.view_count,
          likes: data.like_count,
          comments: data.comment_count,
          uploadDate: data.upload_date,
          duration: data.duration,
          thumbnail: data.thumbnail,
        });
      }
    );
  });
};