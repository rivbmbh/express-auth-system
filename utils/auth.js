import { validationResult } from "express-validator";
import pool from "../database.js";
import "dotenv/config";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

//ambil semua data table user;
const loadUsersData = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result;
};

const findUser = async (column, value) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE ${column} LIKE $1`,
    [value],
  );
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
    const payload = { sub: user.id, role: user.role };
    console.log("payload" + payload);
    const secret = process.env.JWT_SECRET_CODE;
    const token = jwt.sign(payload, secret, {
      expiresIn: "15m",
      algorithm: "HS256", //menentukan algoritma yang dipakai untuk membuat signature
    });
    console.log("jwt token:" + token); //menghasil random char terdiri dari header.payload.signature yang dipisahkan dengan tanda titik.

    res.json({
      message: "Login berhasil dilakukan",
      user,
      token,
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

  const token = authHeader.split(" ")[1];

  try {
    /*
      memverifikasi token berdasarkan payloadnya dengan generate ulang dan mencocokan siganturenya apakah sama atau tidak
      json.verify() juga secara otomatis mengecek expiredAt token-nya jadi kita tidak perlu membuat manual lagi,
      json.verify sendiri sudah tau bagian mana payloadnya jadi cukup kirim token lengkapnya (HEADER.PAYLOAD.SIGNATURE)
    */
    const decoded = jwt.verify(token, process.env.JWT_SECRET_CODE);

    // if (decoded.role !== "admin") {
    //   return res.status(403).json({
    //     message:
    //       "Halaman ini khusus admin bukan user miskin seperti anda yang jadi bahan gabutnya!",
    //   });
    // }

    req.user = decoded;

    // const signatureToken = authHeader.split(".")[2];
    // console.log("token dari request" + signatureToken);
    // const signatureDecoded = decoded.split(".")[2];
    // console.log("token dari decoded" + signatureDecoded);

    // if (signatureToken === signatureDecoded) {
    //   console.log("Token valid!");
    // }

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

export {
  loadUsersData,
  registerUser,
  checkEmail,
  loginUser,
  findUser,
  authenticateToken,
  authorizeRole,
};
