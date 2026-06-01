import { AssemblyAI } from "assemblyai";

console.log(process.env.ASSEMBLYAI_API_KEY);

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "a243e1b865bf4b7e9c0a84bc06029045",
});

export default client;