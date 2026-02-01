module.exports = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Something went wrong"
  });
};
