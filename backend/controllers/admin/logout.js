import jwt from "jsonwebtoken";
import redis from "../../models/redis.js";

const adminLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(200).json({ message: "Already logged out" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // delete refresh token session
    const keys = await redis.keys(`refresh:${decoded.id}:*`);
    if (keys.length) await redis.del(keys);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logout successful" });

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default adminLogout;
