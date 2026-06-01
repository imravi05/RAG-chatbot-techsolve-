import fs from "fs";
import client from "./assemblyai.service.js";
import { downloadAudio } from "./download.service.js";

export const transcribeAudio = async (
  audioFilePath
) => {

  const transcript =
    await client.transcripts.transcribe({
      audio: fs.createReadStream(audioFilePath)
    });

  return {
    text: transcript.text,
    words: transcript.words
  };
};

export const getTranscript = async (
  url,
  videoId
) => {

  const audioPath =
    await downloadAudio(
      url,
      videoId
    );

  const transcript =
    await transcribeAudio(audioPath);

  return transcript;
};