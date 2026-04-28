// test-db.js
const sequelize = require('./src/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connected Successfully");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
  }
})();