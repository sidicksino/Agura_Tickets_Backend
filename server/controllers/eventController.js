const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../db/db');


exports.event = (req, res) => {
    const {
        title,
        description,
        date_time,
        venue_id,
        admin_id,
        category,
        artist_lineup,
        promo_video_url
    } = req.body;

    // Validation basique
    if (!title || !description || !date_time || !venue_id || !admin_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 🆕 Générer automatiquement un UUID
    const event_id = uuidv4();

    // Vérifier que l'admin existe et est bien un Admin
    const checkAdminSql = "SELECT * FROM users WHERE user_id = ? AND role = 'Admin'";
    db.query(checkAdminSql, [admin_id], (err, adminResults) => {
        if (err) return res.status(500).json({ error: err.message });

        if (adminResults.length === 0) {
            return res.status(403).json({ error: 'admin_id is invalid or not an admin' });
        }

        // Insérer l'événement
        const insertSql = `
            INSERT INTO event (
                event_id, title, description, date_time,
                venue_id, admin_id, category, artist_lineup, promo_video_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [
            event_id, title, description, date_time,
            venue_id, admin_id, category,
            JSON.stringify(artist_lineup),
            promo_video_url
        ], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({ message: 'Event created successfully', event_id });
        });
    });
}

