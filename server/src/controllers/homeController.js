let getHomePage = (req, res) => {
    // Nếu bạn dùng middleware xác thực, có thể lấy thông tin user từ req.user
    const user = req.user;

    // Render trang home hoặc trả JSON (tùy bạn)
    return res.render("home", {
        user: user // truyền dữ liệu user ra giao diện nếu cần
    });
};

export default {
    getHomePage
};
