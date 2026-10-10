import { validationResult } from "express-validator";
import pool from "../database/db_connect.js";
import "dotenv/config";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const dashboard = async (req, res) => {
  try {
    res.send("Halaman Dashboard (khusus admin)");
  } catch (err) {
    console.log("error dashbboard page " + err.message);
    return res.status(500).json({
      message: err.message,
    });
  }
};

const findManyUser = async (column, value) => {
  const result = await pool.query(`SELECT * FROM users WHERE ${column} = $1`, [
    value,
  ]);
  return result;
};

const login = async (req, res) => {
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

const register = async (req, res) => {
  const body = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    for (const error of errors.array()) {
      formattedErrors[error.path] = error.msg;
    }
    return res.status(422).json({
      message: "Validasi input gagal",
      errors: formattedErrors,
    });
  }

  try {
    const username = body.username;
    console.log(username);
    const email = body.email;
    const password = await argon2.hash(body.password);
    console.log(password);

    await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
      [username, email, password],
    );
    console.log("user ditambahkan!");
    return res.status(200).json({
      success: true,
      message: "Registrasi berhasil dilakukan",
      redirectTo: "/login",
    });
  } catch (err) {
    console.log("error regis" + err.message);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server" + err.message,
    });
  }
};

const checkEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email LIKE $1", [
    email,
  ]);
  return result;
};

export { register, checkEmail, login, findManyUser, dashboard };
