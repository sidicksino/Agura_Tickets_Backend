const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../db/db');

// Register user
exports.register = async (req, res) => {
  const { email, phone_number, password } = req.body;

  if ((!email && !phone_number) || !password) {
    return res.status(400).json({
      error: 'Provide either email or phone number, with password.'
    });
  }

  if (email && phone_number) {
    return res.status(400).json({
      error: 'Use only one method: email OR phone number.'
    });
  }

  try {
    // Check email uniqueness
    if (email) {
      const [rows] = await db.promise().query(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );
      if (rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    // Check phone uniqueness
    if (phone_number) {
      const [rows] = await db.promise().query(
        'SELECT user_id FROM users WHERE phone_number = ?',
        [phone_number]
      );
      if (rows.length > 0) {
        return res.status(409).json({ error: 'Phone number already in use' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();

    const sql = `
      INSERT INTO users (user_id, email, phone_number, password, role)
      VALUES (?, ?, ?, ?, 'Attendee')
    `;

    await db.promise().query(sql, [
      user_id,
      email || null,
      phone_number || null,
      hashedPassword
    ]);

    res.status(201).json({
      message: 'User registered ✅',
      user_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error ❌' });
  }
};

// Get current user
exports.getMe = (req, res) => {
  const userId = req.user.user_id;

  const sql = `SELECT user_id, email, phone_number, name, profile_photo, role, preferences FROM users WHERE user_id = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(results[0]);
  });
};

// Update profile
exports.updateMe = (req, res) => {
  const userId = req.user.user_id;
  const { name, profile_photo, preferences } = req.body;

  const sql = `
    UPDATE users
    SET name = ?, profile_photo = ?, preferences = ?
    WHERE user_id = ?
  `;

  const preferencesStr = preferences ? JSON.stringify(preferences) : null;

  db.query(sql, [name, profile_photo, preferencesStr, userId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Profile updated successfully ✅' });
  });
};
