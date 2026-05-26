import redis from "../../models/redis.js";
import jwt from "jsonwebtoken";

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      await redis.del(
        `refresh:${decoded.userId}:${decoded.tokenId}`
      );
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("student_access");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(200).json({ message: "Logged out" });
  }
};

export default logout;
