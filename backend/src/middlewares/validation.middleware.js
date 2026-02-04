const validate = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[property]);
      req[property] = parsed; // replace with validated data
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.errors?.[0]?.message || "Invalid request data"
        }
      });
    }
  };
};

module.exports = validate;
