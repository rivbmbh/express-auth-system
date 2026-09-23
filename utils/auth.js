import { matchedData, validationResult } from "express-validator";
import pool from "../database.js";
import argon2 from "argon2";

//ambil semua data table user;
const loadUsersData = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result;
};

const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email LIKE $1", [
    email,
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
    const user = req.loginUser;
    res.json({
      message: "Login berhasil dilakukan",
      user,
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

export { loadUsersData, registerUser, checkEmail, loginUser, findUserByEmail };
