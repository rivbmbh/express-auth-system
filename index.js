import express from "express";
import "dotenv/config";
import multer from "multer";
import pool from "./database.js";

const app = express(); //framework express

/**
 * Middleware 3 baris kode di bawah ini
 */
const upload = multer(); //untuk menerima data dari form-data / multipart form data (biasanya untuk input file/gambar)
app.use(express.json()); //ini = menerima data json dari request || application/json / bodyParser
app.use(express.urlencoded({ extended: true })); // ini untuk menerima data HTML dari form-data

const port = process.env.HTTP_PORT; //port yang diambil dari file .env

// app.get("/", async (req, res) => {
//   try {
//     res.send("Hello Bitch!");
//   } catch (err) {
//     console.log(err.message);
//   }
// });

//app.use() untuk menerima semua jenis method GET, POST, PUT, DELETE bisa diterimanya
app.use("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  console.log(result);
  return res.json({
    msg: "this is the home page",
    data: result,
  });
});

app.post("/login", (req, res) => {
  const body = req.body;
  const { email, password } = body;

  try {
    res.json({
      message: "Email berhasil divalidasi",
      email,
      password,
    });
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(port, () =>
  console.info(`Server ready on http://localhost:${port}`),
);
