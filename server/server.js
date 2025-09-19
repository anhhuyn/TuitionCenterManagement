import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./src/config/viewEngine.js";
import connectDB from "./src/config/configdb.js"; 
import dotenv from "dotenv";
dotenv.config();
import cookieParser from 'cookie-parser';
import cors from 'cors';

import apiRouter from "./src/route/api.js";    
import path from 'path';
import { fileURLToPath } from 'url';  

let app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true // Nếu bạn dùng cookie / header auth
}));

viewEngine(app);

app.use("/v1/api", apiRouter);        

connectDB();

let port = process.env.PORT || 6969;

app.listen(port, () => {
  console.log("Backend Nodejs is running on the port: " + port);
});
