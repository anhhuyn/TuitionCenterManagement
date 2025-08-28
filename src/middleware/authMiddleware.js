import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    try {
        const decoded = jwt.verify(token, 'mk');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};

export default verifyToken;
