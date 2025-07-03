const db = require('../db/db');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../utils/sendOTP');
const bcrypt = require('bcrypt');

// Step 1: Request OTP code
exports.requestReset = async (req, res) => {
  const { emailOrPhone } = req.body;

  const [results] = await db.promise().query(
    `SELECT user_id, email FROM users WHERE email = ? OR phone_number = ?`,
    [emailOrPhone, emailOrPhone]
  );

  if (results.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = results[0];
  const code = generateOTP();
  const expiration = new Date(Date.now() + 10 * 60000); // 10 minutes

  await db.promise().query(
    `INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, ?)`,
    [user.user_id, code, expiration]
  );

  // Send the OTP
  await sendOTP(emailOrPhone, code);

  res.json({ message: 'Code sent by email 📧' });
};

// Step 2: Verify the code
exports.verifyCode = async (req, res) => {
  const { code } = req.body;

  const [results] = await db.promise().query(
    `SELECT * FROM password_resets WHERE code = ? AND expires_at > NOW()`,
    [code]
  );

  if (results.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }

  res.json({ message: 'Code valid ✅', user_id: results[0].user_id });
};

// Step 3: Reset the password
exports.resetPassword = async (req, res) => {
  const { user_id, newPassword, confirmPassword } = req.body;

  // Check that both passwords match
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Both fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match ❌' });
  }

  // Hash the new password
  const hashed = await bcrypt.hash(newPassword, 10);

  // Update in the database
  await db.promise().query(
    `UPDATE users SET password = ? WHERE user_id = ?`,
    [hashed, user_id]
  );

  // Delete used OTP codes
  await db.promise().query(`DELETE FROM password_resets WHERE user_id = ?`, [user_id]);

  res.json({ message: 'Password reset successfully 🔐' });
};
