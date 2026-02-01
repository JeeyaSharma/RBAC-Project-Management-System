require("dotenv").config();
const pool = require("./db");

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ DB Connected Successfully");
    console.log(result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("❌ DB Connection Failed");
    console.error(err);
    process.exit(1);
  }
})();
