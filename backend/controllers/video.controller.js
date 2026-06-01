import { getYoutubeMetadata } from "../services/youtube.service.js";
import { getInstagramMetadata } from "../services/instagram.service.js";
import { calculateEngagementRate } from "../services/engament.service.js";
import { getTranscript } from "../services/transcript.service.js";


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