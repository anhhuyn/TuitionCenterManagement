import bcrypt from 'bcryptjs';
import db from '../models/index.js';

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm người dùng theo email
      let user = await db.User.findOne({
        where: { email: email },
      });

      if (user) {
        // So sánh password người dùng nhập với hash trong DB
        let check = await bcrypt.compare(password, user.password);
        if (check) {
          // Xác thực thành công
          resolve(user); // hoặc resolve({ errCode: 0, user })
        } else {
          // Sai mật khẩu
          resolve(false);
        }
      } else {
        // Không tìm thấy user
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

/*let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm người dùng theo email
      let user = await db.User.findOne({
        where: { email: email },
      });

      if (user) {
        // So sánh trực tiếp mật khẩu nhập với mật khẩu gốc trong DB (không hash)
        if (password === user.password) {
          // Xác thực thành công
          resolve(user);
        } else {
          // Sai mật khẩu
          resolve(false);
        }
      } else {
        // Không tìm thấy user
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};*/


export default {
  handleUserLogin,
};
