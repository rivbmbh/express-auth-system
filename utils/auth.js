import { validationResult } from "express-validator";
import pool from "../database.js";
import "dotenv/config";
import argon2 from "argon2";
import jwt, { decode } from "jsonwebtoken";

//ambil semua data table user;
const loadUsersData = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result;
};

const findUser = async (column, value) => {
  const result = await pool.query(`SELECT * FROM users WHERE ${column} = $1`, [
    value,
  ]);
  return result;
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  try {
    const user = req.loginUser[0];
    console.log("id" + user.id);
    console.log("role" + user.role);
    // const authHeader = req.headers.authorization;
    // console.log("authHeader:" + authHeader);

    // if (!authHeader) {
    //   return res.status(401).json({
    //     message: "Token tidak ditemukan",
    //   });
    // }

    /*
     * sub/subject bisa diisi dengan id user
     * role juga disesuaikan dari role user saat registrasi atau dari DB
     */
    const payload = {
      userID: user.id,
      role: user.role,
      username: user.username,
    };
    console.log("payload" + payload);

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1m",
      algorithm: "HS256", //menentukan algoritma yang dipakai untuk membuat signature
    });
    console.log("access token:" + accessToken); //menghasil random char terdiri dari header.payload.signature yang dipisahkan dengan tanda titik.

    //payload refresh token hanya userID karna nantinya ketika melakukan refresh sistem akan mencari user berdasarkan id-nya di database agar sumber informasi user valid bukan hanya mengambil payload dari access token lama yang belum tentu valid, karena misalnya role nya sudah berubah atau mungkin usernya sudah dihapus dari database
    const refreshToken = jwt.sign(
      {
        userID: user.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    console.log("refresh token:" + refreshToken);

    res.json({
      message: "Login berhasil dilakukan",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log("error login: " + err.message);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const registerUser = async (req, res) => {
  const body = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  try {
    const username = body.username;
    const email = body.email;
    const password = await argon2.hash(body.password);
    console.log(password);

    await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
      [username, email, password],
    );
    console.log("user ditambahkan!");
    res.send("berhasil registrasi!");
  } catch (err) {
    console.log("error regis" + err.message);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const checkEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email LIKE $1", [
    email,
  ]);
  return result;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ditemukan!",
    });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    /*
      memverifikasi accessToken berdasarkan payloadnya dengan generate ulang dan mencocokan siganturenya apakah sama atau tidak
      jwt.verify() juga secara otomatis mengecek expiredAt accessToken-nya jadi kita tidak perlu membuat manual lagi,
      jwt.verify sendiri sudah tau bagian mana payloadnya jadi cukup kirim accessToken lengkapnya (HEADER.PAYLOAD.SIGNATURE)
    */
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token sudah expired!",
      });
    }
    return res.status(401).json({
      message: "Token tidak valid!",
    });
  }
};

const authorizeRole = (...allowedRoles) => {
  /**
   * allowedRole nanti akan berisi role-role apa saja yang diperbolehkan masuk ke halaman tertentu, jadi AloowedRoles = ["admin"]/["user"]/["admin", "user"] jadi jika keduanya ada berarti kedua role tersebut bisa akses halaman tersebut, jadi pemanggilannya authorizeRole("admin", "admin")
   */
  return (req, res, next) => {
    const user = req.user;

    //cek apakah usr sudah login!
    if (!user) {
      return res.status(401).json({
        message: "Unathorized",
      });
    }

    //cek apakh rolenya sesuai
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    next();
  };
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  console.log("refreshToken:  " + refreshToken);

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required!",
    });
  }
  const secretRefreshToken = process.env.REFRESH_TOKEN_SECRET;
  const secretAccessToken = process.env.ACCESS_TOKEN_SECRET;
  console.log("berikutnya proses pemeriksaan refresh token...");

  // jwt.verify(
  //   refreshToken,
  //   secretRefreshToken,
  //   /**
  //     1. err/error, jika bagian ini = true berarti refresh token tidak valid atau sudah expired, validasinya mirip seperti access
  //         token yang mencocokan signaturenya jika valid maka selanjutnya mengecek waktu expirednya.
  //     2. decoded, nah jika error = false atau refresh token valid maka decoded akan mengembalikan payload dari refresh token,
  //         cth: {userID: '2'}
  //    */
  //   async (err, decoded) => {
  //     if (err) {
  //       // if (err.name === "TokenExpiredError") {
  //       //   return res.status(403).json({
  //       //     message: "expired refresh token",
  //       //   });
  //       // }
  //       return res.status(403).json({
  //         message: "Invalid refresh token or expired",
  //       });
  //     }

  //     //cari user di database
  //     console.log("userID" + decoded.userID);
  //     const user = await findUser("id", decoded.userID);
  //     // const user = await pool.query("SELECT * FROM users WHERE id = $1", [
  //     //   decoded.userID,
  //     // ]);
  //     console.log("user data " + user.rows[0].username);
  //     //jika token valid buat access token baru
  //     const newAccessToken = jwt.sign(
  //       {
  //         userID: user.rows[0].id,
  //         role: user.rows[0].role,
  //       },
  //       secretAccessToken,
  //       {
  //         expiresIn: "10m",
  //       },
  //     );
  //     console.log("new access token " + newAccessToken);
  //     res.json({
  //       accessToken: newAccessToken,
  //     });
  //   },
  // );

  try {
    const decoded = jwt.verify(refreshToken, secretRefreshToken);
    console.log("userID " + decoded.userID);

    const user = (await findUser("id", decoded.userID)).rows[0];
    console.log("user " + user.username);

    if (!user) {
      throw new Error("user tidak ditemukan");
    }

    const newAccessToken = jwt.sign(
      {
        userID: user.id,
        role: user.role,
        username: user.username,
      },
      secretAccessToken,
      {
        expiresIn: "1h",
      },
    );

    console.log(newAccessToken);
    res.json({
      message: "success refresh token",
      accessToken: newAccessToken,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        message: "Token sudah expired!",
      });
    }
    return res.status(403).json({
      message: "Token tidak valid atau sudah expired!",
    });
  }
};

export {
  loadUsersData,
  registerUser,
  checkEmail,
  loginUser,
  findUser,
  authenticateToken,
  authorizeRole,
  refreshToken,
};
