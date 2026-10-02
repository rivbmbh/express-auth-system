import express from "express";
import "dotenv/config";
import pageRoutes from "./src/routes/pageRoutes.js";
// import multer from "multer";

const app = express(); //framework express

/**
 * Middleware 3 baris kode di bawah ini
 */
// const upload = multer(); //untuk menerima data dari form-data / multipart form data (biasanya untuk input file/gambar)
app.use(express.json()); //ini = menerima data json dari request || application/json / bodyParser
// app.use(express.urlencoded({ extended: true })); // ini untuk menerima data HTML dari form-data

const port = process.env.HTTP_PORT; //port yang diambil dari file .env

// app.get("/", async (req, res) => {
//   try {
//     res.send("Hello Bitch!");
//   } catch (err) {
//     console.log(err.message);
//   }
// });

//app.use() untuk menerima semua jenis method GET, POST, PUT, DELETE bisa diterimanya
// app.use("/", async (req, res) => {
//   const result = loadUsersData();
//   return res.json({
//     msg: "this is the home page",
//     data: result,
//   });
// });

// app.get("/dashboard", authenticateToken, authorizeRole("admin"), dashboard);

//regis
// app.post(
//   "/register",
//   [
//     body("username").isLength({ min: 3 }),
//     body("email")
//       .custom(async (value) => {
//         const result = await checkEmail(value);
//         console.log("hasil cek email" + result);

//         if (result.rows.length > 0) {
//           throw new Error("Email sudah terdaftar!, masukan email yang berbeda");
//         }
//         return true;
//       })
//       // .trim()
//       .isEmail(),
//     body("password").isLength({ min: 8 }),
//     body("passwordConfirmation")
//       .isLength({ min: 8 })
//       .withMessage("Password minimal 8 karakter dek!")
//       .custom((value, { req }) => {
//         const password = req.body.password;
//         // if (!value === password) {
//         //   throw new Error("konfirmasi password tidak sama dengan password!");
//         // }
//         // return true;
//         return value === password;
//       })
//       .withMessage("Password confirmation tidak cocok!"),
//   ],
//   registerUser,
// );

//login
// app.post(
//   "/login",
//   [
//     body("email")
//       .isEmail()
//       .withMessage("email tidak valid")
//       .custom(async (email, { req }) => {
//         const user = await findUser("email", email); //cari apakah user ada di DB
//         if (!user.rows) {
//           throw new Error("email atau password salah!");
//         }
//         req.loginUser = user.rows; //teruskan ke validasi input berikutnya melalui req body
//         console.log("akun anda terdaftar" + user.rows);
//         return true;
//       }),
//     body("password")
//       .notEmpty()
//       .withMessage("password wajib di isi")
//       .isLength({ min: 8 })
//       .withMessage("password minimal 8 karakter!")
//       .custom(async (password, { req }) => {
//         const user = req.loginUser;
//         console.log(user);
//         const passwordFromDB = user[0].password;
//         console.log(passwordFromDB);

//         const isValid = await argon2.verify(passwordFromDB, password);
//         console.log(isValid);

//         if (!isValid) {
//           throw new Error("password yang anda masukan salah!");
//         }
//         return true;
//       }),
//   ],
//   loginUser,
// );

// app.post("/logout", (req, res) => {
//   res.clearCookie("refreshToken");
//   return res.json({
//     message: "logout berhasil",
//   });
// });

// app.get("/hello", query("person").notEmpty().escape(), (req, res) => {
//   const result = validationResult(req);
//   console.log("QUERY:", req.query.person);
//   if (result.isEmpty()) {
//     const data = matchedData(req);
//     return res.send(`Hello ${req.query.person}`);
//   }
//   // res.send(result.array());
//   res.send({ errors: result.array() });
// });

//refresh token
// app.post("/refresh_token", refreshToken);

/*
jadi ini mencocokan semua route yang ada di file pageRoutes.js, dengan prefix apakah diawali dengan tanda '/' lalu mengikuti route yang ada, misal user req /dashboard maka / + pageRoutes.js akan mencocokan route /dashboard yang ada di file pageRoutes.js juga dengan methodnya walau enpointnya sama, tapi methodnya berbeda maka tidak akan match, misal di pageRoutes.js methodnya GET tapi user req methodnya POST maka tidak akan match, begitu juga sebaliknya.
*/
app.use("/", pageRoutes);

app.listen(port, () =>
  console.info(`Server ready on http://localhost:${port}`),
);
