import { getYoutubeMetadata } from "../services/youtube.service.js";
import { getInstagramMetadata } from "../services/instagram.service.js";

export const analyzeVideos = async (req, res) => {
  try {
    const { youtubeUrl, instagramUrl } = req.body;

    const youtubeData = await getYoutubeMetadata(youtubeUrl);

    const instagramData = await getInstagramMetadata(instagramUrl);

    res.status(200).json({
      success: true,
      youtube: youtubeData,
      instagram: instagramData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};