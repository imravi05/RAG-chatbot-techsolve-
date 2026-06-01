import { AssemblyAI } from "assemblyai";
console.log(process.env.ASSEMBLYAI_API_KEY);
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

export default client;