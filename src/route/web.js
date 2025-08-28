import express from "express";
import jwt from 'jsonwebtoken';
import loginController from '../controllers/loginController.js';
import homeController from '../controllers/homeController.js';
import verifyToken from '../middleware/authMiddleware.js';
import forgotPasswordController from "../controllers/forgotPasswordController.js";
import registerController from '../controllers/registerController.js'; 


let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", (req, res) => {
        return res.render("login");
    });

    router.get('/login', (req, res) => {
        return res.render("login");
    });

    router.post('/login', loginController.handleLogin);

    router.get('/home', verifyToken, homeController.getHomePage);
    router.get('/forgot-password', (req, res) => {
        return res.render("forgotPassword"); 
    });
    router.post("/forgot-password", forgotPasswordController.requestOTP);
    router.post("/reset-password", forgotPasswordController.resetPassword);
    router.post("/forgot-password/verify-otp", forgotPasswordController.verifyOTPCode); //vậy là hai cái đường dẫn không đc trung nhau, nãy viết cái này trước nên cái này sống, cái kia chết
    router.get('/register', registerController.getRegisterPage);
    router.post('/register', registerController.handleRegister);
    router.get('/verify-otp', registerController.getOTPPage);
    router.post('/verify-otp', registerController.handleVerifyOTP);

    return app.use("/", router);
};

export default initWebRoutes;
