import express from "express";
import "dotenv/config";
import pageRoutes from "./src/routes/pageRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
// import multer from "multer";

const app = express(); //framework express

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware untuk mengatur CORS
//ini tidak pengaruh jika back end dan frontend berada di domain yang sama, tapi jika beda domain maka harus diaktifkan, jadi coba buat file project terpisah dan jalankan di port yang berbeda, misal backend di port 3000 dan frontend di port 3001, maka harus diaktifkan middleware ini agar bisa saling berkomunikasi.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://authplatform.id"); // Ganti dengan domain frontend Anda
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // Mengirimkan respons kosong untuk permintaan OPTIONS
  }
  next();
});

/**
 * Middleware 3 baris kode di bawah ini
 */
// const upload = multer(); //untuk menerima data dari form-data / multipart form data (biasanya untuk input file/gambar)
app.use(express.json()); //ini = menerima data json dari request || application/json / bodyParser
app.use(express.urlencoded({ extended: true })); // ini untuk menerima data HTML dari form-data
app.use(express.static(path.join(__dirname, "src", "public"))); // serve static assets from src/public
app.set("view engine", "ejs"); //ini untuk menggunakan template engine ejs
app.set("views", path.join(__dirname, "src", "views")); //ini untuk menentukan folder views yang akan digunakan untuk menaruh file ejs
const port = process.env.HTTP_PORT; //port yang diambil dari file .env

/*
jadi ini mencocokan semua route yang ada di file pageRoutes.js, dengan prefix apakah diawali dengan tanda '/' lalu mengikuti route yang ada, misal user req /dashboard maka / + pageRoutes.js akan mencocokan route /dashboard yang ada di file pageRoutes.js juga dengan methodnya walau enpointnya sama, tapi methodnya berbeda maka tidak akan match, misal di pageRoutes.js methodnya GET tapi user req methodnya POST maka tidak akan match, begitu juga sebaliknya.
*/
app.use("/", pageRoutes);

app.listen(port, () =>
  console.info(`Server ready on http://localhost:${port}`),
);
