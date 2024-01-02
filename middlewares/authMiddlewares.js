const jwt = require("jsonwebtoken");

module.exports.authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return res.status(409).json({
      error: "Please login first",
    });
  } else {
    try {
      const deCodeToke = await jwt.verify(accessToken, process.env.SECRET);
      req.role = deCodeToke.role;
      req.id = deCodeToke.id;
      next();
    } catch (error) {
      return res.status(409).json({
        error: "Please login",
      });
    }
  }
};
