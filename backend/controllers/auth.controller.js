const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("BODY:", req.body);

    const pool = await poolPromise;

    // Check whether user already exists
    const existingResult = await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("username", sql.VarChar, username)
      .query(`
        SELECT *
        FROM users
        WHERE email = @email OR username = @username
      `);

    const existing = existingResult.recordset;

    if (existing.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO users (username, email, password)
        OUTPUT INSERTED.id
        VALUES (@username, @email, @password)
      `);

    const userId = result.recordset[0].id;

    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        username,
        email,
      },
    });

  } catch (err) {
    console.error("Signup Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("identifier", sql.VarChar, identifier)
      .query(`
        SELECT *
        FROM users
        WHERE email = @identifier
           OR username = @identifier
      `);

    const users = result.recordset;

    if (users.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};