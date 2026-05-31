import { exec } from "child_process";

export const getInstagramMetadata = (url) => {
  return new Promise((resolve, reject) => {
    exec(
      `yt-dlp --dump-json "${url}"`,
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const data = JSON.parse(stdout);

        resolve({
          platform: "instagram",
          title: data.title,
          creator: data.uploader,
          views: data.view_count,
          likes: data.like_count,
          comments: data.comment_count,
          duration: data.duration,
          thumbnail: data.thumbnail,
          uploadDate: data.upload_date
        });
      }
    );
  });
};