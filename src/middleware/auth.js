import "dotenv/config";
import jwt from "jsonwebtoken";
import { findManyUser } from "../controllers/pageControllers.js";

const toLogin = (res) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  return res.redirect("/login");
};

const createRefreshToken = (data) => {
  const payload = {
    id: data.id,
  };
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d", //1hari
  });

  return refreshToken;
};

const createAccessToken = (data) => {
  const payload = {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role,
  };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });
  return accessToken;
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 1 * 24 * 60 * 60 * 1000, //1hari
  });
};

const setAccessCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 1 * 60 * 1000, //5m
  });
};

const refreshTokenMiidleware = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("refresh token dijalankan...");
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = (await findManyUser("id", decoded.id)).rows[0];

    if (!user) {
      throw new Error("user not found");
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    setAccessCookie(res, newAccessToken);
    setRefreshCookie(res, newRefreshToken);
    console.log("refresh token berhasil dijalankan!");
    // const data = ;
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    };
    return next();
  } catch (err) {
    console.log(err.name, err.message);
    // if (err.message === "user not found") {
    //   toLogin(res);
    // }
    return toLogin(res);
  }
};

const authenticateToken = (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;
  console.log("accessToken" + accessToken);
  console.log("refreshToken" + refreshToken);
  // const accessToken = token.split(" ")[1]
  if (accessToken) {
    try {
      // if (!accessToken) {
      //   throw new Error("Token not found");
      // }

      /*
      memverifikasi accessToken berdasarkan payloadnya dengan generate ulang dan mencocokan siganturenya apakah sama atau tidak
      jwt.verify() juga secara otomatis mengecek expiredAt accessToken-nya jadi kita tidak perlu membuat manual lagi,
      jwt.verify sendiri sudah tau bagian mana payloadnya jadi cukup kirim accessToken lengkapnya (HEADER.PAYLOAD.SIGNATURE)
    */
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      req.user = decoded;

      return next(); //lanjut ke authorizeRole
    } catch (err) {
      console.log("Access Token " + err.name, err.message);
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError"
      ) {
        refreshTokenMiidleware(req, res, next);
      }
    }
  }

  if (!refreshToken) {
    return toLogin(res);
  }

  refreshTokenMiidleware(req, res, next);
};

const authorizeRole = (...allowedRoles) => {
  /**
   * allowedRole nanti akan berisi role-role apa saja yang diperbolehkan masuk ke halaman tertentu, jadi AloowedRoles = ["admin"]/["user"]/["admin", "user"] jadi jika keduanya ada berarti kedua role tersebut bisa akses halaman tersebut, jadi pemanggilannya authorizeRole("admin", "admin")
   */
  return (req, res, next) => {
    const user = req.user;
    console.log(user);

    //cek apakah usr sudah login!
    if (!user) {
      return toLogin(res);
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

//dipakai kalo menggunakan fetch API dengan mthod POST
// const refreshToken = async (req, res) => {
//   const refreshToken = req.cookies?.refreshToken;

//   if (!refreshToken) {
//     //BUAT FUNC CLEAR COOKIE
//     return res.redirect("/login");
//   }

//   const secretRefreshToken = process.env.REFRESH_TOKEN_SECRET;
//   const secretAccessToken = process.env.ACCESS_TOKEN_SECRET;

//   try {
//     const decoded = jwt.verify(refreshToken, secretRefreshToken);

//     const user = (await findManyUser("id", decoded.userID)).rows[0];

//     if (!user) {
//       console.log("user tidak ditemukan");
//       return res.redirect("/login");
//     }

//     console.log("user " + user.username);

//     const newAccessToken = jwt.sign(
//       {
//         userID: user.id,
//         role: user.role,
//         username: user.username,
//       },
//       secretAccessToken,
//       {
//         expiresIn: "1m",
//       },
//     );

//     res.cookie("accessToken", newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 1 * 60 * 1000, //5menit
//       path: "/",
//     });
//     console.log("refresh token berhasil dijalankan");
//     return res.redirect("/dashboard");
//   } catch (err) {
//     console.log(err.name, err.message);
//     res.clearCookie("accessToken", { path: "/" });
//     res.clearCookie("refreshToken", { path: "/" });
//     return res.redirect("/login");
//   }
// };

export {
  authenticateToken,
  authorizeRole,
  // refreshToken,
  createAccessToken,
  createRefreshToken,
  setAccessCookie,
  setRefreshCookie,
  refreshTokenMiidleware,
  toLogin,
};
