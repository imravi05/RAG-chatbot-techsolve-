import cors from 'cors';
import express from 'express';
import videoRoutes from './routes/video.routes.js';


const app = express();
app.use(cors());
app.use(express.json());  
const PORT = process.env.PORT || 5000;


// routes 
app.use("/api/v1/videos", videoRoutes);



const server = app.listen(5000, () => {
  console.log('Server is running on port 5000');
});




