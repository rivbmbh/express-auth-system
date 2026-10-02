import "dotenv/config";
import jwt from "jsonwebtoken";
import { findManyUser } from "../controllers/pageControllers.js";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ditemukan!",
    });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    /*
      memverifikasi accessToken berdasarkan payloadnya dengan generate ulang dan mencocokan siganturenya apakah sama atau tidak
      jwt.verify() juga secara otomatis mengecek expiredAt accessToken-nya jadi kita tidak perlu membuat manual lagi,
      jwt.verify sendiri sudah tau bagian mana payloadnya jadi cukup kirim accessToken lengkapnya (HEADER.PAYLOAD.SIGNATURE)
    */
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;

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

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  console.log("refreshToken:  " + refreshToken);

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required!",
    });
  }
  const secretRefreshToken = process.env.REFRESH_TOKEN_SECRET;
  const secretAccessToken = process.env.ACCESS_TOKEN_SECRET;
  console.log("berikutnya proses pemeriksaan refresh token...");

  // jwt.verify(
  //   refreshToken,
  //   secretRefreshToken,
  //   /**
  //     1. err/error, jika bagian ini = true berarti refresh token tidak valid atau sudah expired, validasinya mirip seperti access
  //         token yang mencocokan signaturenya jika valid maka selanjutnya mengecek waktu expirednya.
  //     2. decoded, nah jika error = false atau refresh token valid maka decoded akan mengembalikan payload dari refresh token,
  //         cth: {userID: '2'}
  //    */
  //   async (err, decoded) => {
  //     if (err) {
  //       // if (err.name === "TokenExpiredError") {
  //       //   return res.status(403).json({
  //       //     message: "expired refresh token",
  //       //   });
  //       // }
  //       return res.status(403).json({
  //         message: "Invalid refresh token or expired",
  //       });
  //     }

  //     //cari user di database
  //     console.log("userID" + decoded.userID);
  //     const user = await findUser("id", decoded.userID);
  //     // const user = await pool.query("SELECT * FROM users WHERE id = $1", [
  //     //   decoded.userID,
  //     // ]);
  //     console.log("user data " + user.rows[0].username);
  //     //jika token valid buat access token baru
  //     const newAccessToken = jwt.sign(
  //       {
  //         userID: user.rows[0].id,
  //         role: user.rows[0].role,
  //       },
  //       secretAccessToken,
  //       {
  //         expiresIn: "10m",
  //       },
  //     );
  //     console.log("new access token " + newAccessToken);
  //     res.json({
  //       accessToken: newAccessToken,
  //     });
  //   },
  // );

  try {
    const decoded = jwt.verify(refreshToken, secretRefreshToken);
    console.log("userID " + decoded.userID);

    const user = (await findManyUser("id", decoded.userID)).rows[0];
    console.log("user " + user.username);

    if (!user) {
      throw new Error("user tidak ditemukan");
    }

    const newAccessToken = jwt.sign(
      {
        userID: user.id,
        role: user.role,
        username: user.username,
      },
      secretAccessToken,
      {
        expiresIn: "1h",
      },
    );

    console.log(newAccessToken);
    res.json({
      message: "success refresh token",
      accessToken: newAccessToken,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        message: "Token sudah expired!",
      });
    }
    return res.status(403).json({
      message: "Token tidak valid atau sudah expired!",
    });
  }
};

export { authenticateToken, authorizeRole, refreshToken };
