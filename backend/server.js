import cors from 'cors';
import express from 'express';
import videoRoutes from './routes/video.routes.js';
import dotenv from 'dotenv';



const app = express();

dotenv.config();
app.use(express.json());
app.disable('x-powered-by');  
const PORT = process.env.PORT || 5000;


// routes 
app.use("/api/v1/videos", videoRoutes);



const server = app.listen(5000, () => {
  console.log('Server is running on port 5000');
  // console.log(`API Key: ${process.env.ASSEMBLYAI_API_KEY}`);
  // console.log(`Pinecone API Key: ${process.env.PINECONE_API_KEY}`); 
});




