import "dotenv/config";
import jwt from "jsonwebtoken";
import { findManyUser } from "../controllers/pageControllers.js";

const authenticateToken = (req, res, next) => {
  // const authHeader = req.headers.authorization;
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return res.redirect("/refresh-token");
  }

  // const accessToken = token.split(" ")[1];

  try {
    /*
      memverifikasi accessToken berdasarkan payloadnya dengan generate ulang dan mencocokan siganturenya apakah sama atau tidak
      jwt.verify() juga secara otomatis mengecek expiredAt accessToken-nya jadi kita tidak perlu membuat manual lagi,
      jwt.verify sendiri sudah tau bagian mana payloadnya jadi cukup kirim accessToken lengkapnya (HEADER.PAYLOAD.SIGNATURE)
    */
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;

    return next(); //lanjut ke authorizeRole
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.redirect("/refresh-token");
    }
    console.error(err);
    return res.status(500).send("Internal server error");
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
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.redirect("/login");
  }

  const secretRefreshToken = process.env.REFRESH_TOKEN_SECRET;
  const secretAccessToken = process.env.ACCESS_TOKEN_SECRET;

  try {
    const decoded = jwt.verify(refreshToken, secretRefreshToken);

    const user = (await findManyUser("id", decoded.userID)).rows[0];

    if (!user) {
      console.log("user tidak ditemukan");
      return res.redirect("/login");
    }

    console.log("user " + user.username);

    const newAccessToken = jwt.sign(
      {
        userID: user.id,
        role: user.role,
        username: user.username,
      },
      secretAccessToken,
      {
        expiresIn: "1m",
      },
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 60 * 1000, //5menit
      path: "/",
    });
    console.log("refresh token berhasil dijalankan");
    return res.redirect("/dasboard");
  } catch (err) {
    console.log(err.name, err.message);
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    return res.redirect("/login");
  }
};

export { authenticateToken, authorizeRole, refreshToken };
