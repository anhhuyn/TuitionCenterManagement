import express from "express"; // nạp express
import bodyParser from "body-parser"; // nạp body-parser để lấy tham số từ client (/user?id=7)
import viewEngine from "./src/config/viewEngine.js"; // nạp viewEngine
import initWebRoutes from "./src/route/web.js"; // nạp file web route
import connectDB from "./src/config/configdb.js"; 
import dotenv from "dotenv";
dotenv.config();// gói dotenv để load biến môi trường từ file .env
import cookieParser from 'cookie-parser';

let app = express();
app.use(cookieParser());
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "./views"); 

// ================== CONFIG APP ==================
app.use(bodyParser.json()); // parse dữ liệu JSON từ client
app.use(bodyParser.urlencoded({ extended: true })); // parse dữ liệu từ form HTML
viewEngine(app);  // cấu hình view engine (EJS + static files)
initWebRoutes(app); // khởi tạo route
connectDB(); // kết nối database

// ================== SERVER LISTEN ==================
let port = process.env.PORT || 6969; // lấy PORT từ .env hoặc default = 6969

app.listen(port, () => {
  console.log("Backend Nodejs is running on the port: " + port);
});
