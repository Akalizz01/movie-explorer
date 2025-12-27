const express = require('express');
const router = express.Router();
const connection = require('../database/db');
const jwt = require('jsonwebtoken');

// REGISTO
router.post('/register', (req, res) => {
    const { nome, email, password } = req.body;

    connection.query(
        "INSERT INTO utilizadores (nome, email, password) VALUES (?, ?, ?)",
        [nome, email, password],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            return res.json({ message: "Utilizador registado com sucesso!" });
        }
    );
});


// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  connection.query(
    "SELECT * FROM utilizadores WHERE email = ? AND password = ?",
    [email, password],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length === 0) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      const user = rows[0];

      const token = jwt.sign(
        { id: user.id, email: user.email },
        user.password
      );

      res.json({ 
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email
        }
      });
    }
  );
});

module.exports = router;
