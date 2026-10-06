import { Router } from "express";
import {
  register,
  login,
  dashboard,
  findManyUser,
  checkEmail,
} from "../controllers/pageControllers.js";
import {
  authenticateToken,
  authorizeRole,
  refreshToken,
} from "../middleware/auth.js";
import argon2 from "argon2";
import { body } from "express-validator";

const router = Router();

router.get("/", (req, res) => {
  const data = {
    title: "Home Page",
    page: "",
  };
  res.render("main", data);
});

//regis
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }),
    body("email")
      .custom(async (value) => {
        const result = await checkEmail(value);
        console.log("hasil cek email" + result);

        if (result.rows.length > 0) {
          throw new Error("Email sudah terdaftar!, masukan email yang berbeda");
        }
        return true;
      })
      // .trim()
      .isEmail(),
    body("password").isLength({ min: 8 }),
    body("passwordConfirmation")
      .isLength({ min: 8 })
      .withMessage("Password minimal 8 karakter dek!")
      .custom((value, { req }) => {
        const password = req.body.password;
        // if (!value === password) {
        //   throw new Error("konfirmasi password tidak sama dengan password!");
        // }
        // return true;
        return value === password;
      })
      .withMessage("Password confirmation tidak cocok!"),
  ],
  register,
);

//login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("email tidak valid")
      .custom(async (email, { req }) => {
        const user = await findManyUser("email", email); //cari apakah user ada di DB
        if (!user.rows) {
          throw new Error("email atau password salah!");
        }
        req.loginUser = user.rows; //teruskan ke validasi input berikutnya melalui req body
        console.log("akun anda terdaftar" + user.rows);
        return true;
      }),
    body("password")
      .notEmpty()
      .withMessage("password wajib di isi")
      .isLength({ min: 8 })
      .withMessage("password minimal 8 karakter!")
      .custom(async (password, { req }) => {
        const user = req.loginUser;
        console.log(user);
        const passwordFromDB = user[0].password;
        console.log(passwordFromDB);

        const isValid = await argon2.verify(passwordFromDB, password);
        console.log(isValid);

        if (!isValid) {
          throw new Error("password yang anda masukan salah!");
        }
        return true;
      }),
  ],
  login,
);

router.post("/refresh_token", refreshToken);
router.get("/dashboard", authenticateToken, authorizeRole("admin"), dashboard);
router.get("/login", (req, res) => {
  const data = {
    title: "Login Page",
    page: "login",
  };
  res.render("main", data);
});

router.get("/register", (req, res) => {
  const data = {
    title: "Register Page",
    page: "register",
  };
  res.render("main", data);
});

export default router;
