import { getYoutubeMetadata } from "../services/youtube.service.js";
import { getInstagramMetadata } from "../services/instagram.service.js";
import { calculateEngagementRate } from "../services/engament.service.js";
import { getTranscript } from "../services/transcript.service.js";
import { chunkTranscript } from "../services/chunking.service.js";
import { storeChunks } from "../services/vector.service.js";


export const analyzeVideos = async (req, res) => {
  try {
    const { youtubeUrl, instagramUrl } = req.body;

    const youtubeData = await getYoutubeMetadata(youtubeUrl);

    const instagramData = await getInstagramMetadata(instagramUrl);
    
    const youtubeER = calculateEngagementRate(
        youtubeData.views,
        youtubeData.likes,
        youtubeData.comments
        );

    const instagramER = calculateEngagementRate(
    instagramData.views,
    instagramData.likes,
    instagramData.comments
        );

        youtubeData.engagementRate = youtubeER;
        instagramData.engagementRate = instagramER;

        const youtubeTranscript = await getTranscript(
                youtubeUrl,
                "youtube_video"
               );

      const instagramTranscript = await getTranscript(
                instagramUrl,
                "instagram_video"
              );

const youtubeChunks =
  await chunkTranscript(
    youtubeTranscript.text,
    "A"
  );

await storeChunks(
  youtubeChunks
);

const instagramChunks =
  await chunkTranscript(
    instagramTranscript.text,
    "B"
  );

await storeChunks(
  instagramChunks
);

    res.status(200).json({
      success: true,
      trandcripts:{
        metadata : youtubeData,
        transcript : youtubeTranscript
      },
      instagram:{
        metadata : instagramData,
        transcript : instagramTranscript  
      }
      
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};