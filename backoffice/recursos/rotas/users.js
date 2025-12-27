const express = require('express');
const router = express.Router();
const connection = require('../database/db');

// Listar utilizadores
router.get('/', (req, res) => {
  connection.query(
    "SELECT id, nome, email FROM utilizadores",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(rows);
    }
  );
});

module.exports = router;
