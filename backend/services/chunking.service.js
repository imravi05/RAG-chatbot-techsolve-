import { RecursiveCharacterTextSplitter }
from "@langchain/textsplitters";

export const chunkTranscript = async (
  transcript,
  videoId
) => {

  const splitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

  const docs =
    await splitter.createDocuments([
      transcript
    ]);

  return docs.map((doc, index) => ({
    text: doc.pageContent,

    metadata: {
      videoId,
      chunkIndex: index + 1,
    },
  }));
};