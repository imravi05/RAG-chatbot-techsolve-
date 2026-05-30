import cors from 'cors';
import express from 'express';
import videoRoutes from './routes/video.routes.js';


const app = express();
app.use(cors());
app.use(express.json());  


// routes 
app.use("/api/v1/videos", videoRoutes);



const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});




