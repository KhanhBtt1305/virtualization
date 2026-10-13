const { getUserByUsername } = require('./signinModel');

const login = async (req, res) => {
  try {
    const { tai_khoan, matkhau } = req.body;
    console.log("BODY:", req.body);

    const rows = await getUserByUsername(tai_khoan);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }
    const user = rows[0];
    if (matkhau !== user.password) {
      return res.status(401).json({ message: "Mật khẩu sai" });
    }
    return res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


module.exports = { login };