import jwt from "jsonwebtoken";

const authMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {

      // ✅ Read token from cookies
      const token =
        req.cookies?.accessToken ||
        req.cookies?.faculty_access ||
        req.cookies?.student_access ||
        req.cookies?.super_access;

      if (!token) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      // ✅ Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

      req.user = decoded;

      // ✅ Role check
      if (
        allowedRoles.length &&
        !allowedRoles.includes(decoded.role)
      ) {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      next();

    } catch (error) {
      console.error("Auth Middleware Error:", error);

      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }
  };
};

export default authMiddleware;