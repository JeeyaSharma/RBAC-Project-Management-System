const isProduction = process.env.NODE_ENV === "production";

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";

  // 🔹 Log safely
  if (!isProduction) {
    console.error(err);
  } else {
    console.error({
      message: err.message,
      code: errorCode,
      statusCode
    });
  }

  // 🔹 Handle known DB errors (Postgres)
  if (err.code === "23505") {
    return res.status(409).json({
      error: "DUPLICATE_RESOURCE",
      message: "Resource already exists"
    });
  }

  if (err.code === "22P02") {
    return res.status(400).json({
      error: "INVALID_INPUT",
      message: "Invalid input format"
    });
  }

  // 🔹 Standard API error response
  res.status(statusCode).json({
    error: errorCode,
    message:
      isProduction && statusCode === 500
        ? "Internal server error"
        : err.message || "Something went wrong"
  });
};
