import { validationResult } from "express-validator";
import pool from "../database/db_connect.js";
import "dotenv/config";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  createAccessToken,
  createRefreshToken,
  setAccessCookie,
  setRefreshCookie,
} from "../middleware/auth.js";

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
    console.log("error validasi input login");
    const formattedErrors = {};
    for (const error of errors.array()) {
      console.log(error.path);
      formattedErrors[error.path] = error.msg;
    }
    console.log(formattedErrors);
    return res.status(422).json({
      message: "Validasi input gagal",
      errors: formattedErrors,
    });
  }

  try {
    const user = req.loginUser[0];
    // const authHeader = req.headers.authorization;
    // console.log("authHeader:" + authHeader);

    // if (!authHeader) {
    //   return res.status(401).json({
    //     message: "Token tidak ditemukan",
    //   });
    // }

    const accessToken = createAccessToken(user); //menghasil random char terdiri dari header.payload.signature yang dipisahkan dengan tanda titik.

    //payload refresh token hanya userID karna nantinya ketika melakukan refresh sistem akan mencari user berdasarkan id-nya di database agar sumber informasi user valid bukan hanya mengambil payload dari access token lama yang belum tentu valid, karena misalnya role nya sudah berubah atau mungkin usernya sudah dihapus dari database
    const refreshToken = createRefreshToken(user);

    //set cookie
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login berhasil dilakukan",
      //kenapa data user dikrim ? untuk memaksimalkan data diprofil user misalnya
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      redirectTo: "/dashboard",
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
