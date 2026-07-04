require('dotenv').config({ path: './.env' });
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
console.log("ENV CHECK:", process.env.DB_SERVER);

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: "dhruv_babriya28",
  password: "Dhruv@281006",
  server: "10.177.93.97",
  database: "RecoveryDB",
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Global pool
let pool;

// Connect to DB
async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ Connected to SQL Server");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err);
  }
}
connectDB();

// ================= API =================

// Save appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, email, phone, service, date, message } = req.body;

    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('service', sql.NVarChar, service)
      .input('date', sql.NVarChar, date)
      .input('message', sql.NVarChar, message)
      .query(`
        INSERT INTO Appointments 
        (Name, Email, Phone, Service, Date, Message, createdat)
        VALUES (@name, @email, @phone, @service, @date, @message, GETDATE())
      `);

    res.json({ success: true, message: "Appointment saved!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT * FROM Appointments ORDER BY createdat DESC');

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});