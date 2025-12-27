const express = require('express');
const router = express.Router();
const connection = require('../database/db');
const jwt = require('jsonwebtoken');

// Função para obter user_id a partir do token
function getUserId(req) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.decode(token);
    return decoded?.id || null;
}

// ADICIONAR AOS FAVORITOS
router.post('/:movieId', (req, res) => {
    const userId = getUserId(req);
    const movieId = req.params.movieId;

    if (!userId) {
        return res.status(401).json({ error: "Token inválido ou em falta." });
    }

    connection.query(
        "INSERT INTO favoritos (user_id, movie_id) VALUES (?, ?)",
        [userId, movieId],
        (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: "Este filme já está nos favoritos." });
                }
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: "Filme adicionado aos favoritos!" });
        }
    );
});

// REMOVER DOS FAVORITOS
router.delete('/:movieId', (req, res) => {
    const userId = getUserId(req);
    const movieId = req.params.movieId;

    if (!userId) {
        return res.status(401).json({ error: "Token inválido ou em falta." });
    }

    connection.query(
        "DELETE FROM favoritos WHERE user_id = ? AND movie_id = ?",
        [userId, movieId],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: "Filme removido dos favoritos!" });
        }
    );
});

// LISTAR FAVORITOS DO UTILIZADOR
router.get('/', (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
        return res.status(401).json({ error: "Token inválido ou em falta." });
    }

    connection.query(
        `SELECT fs.*
         FROM favoritos f
         JOIN filmes_series fs ON fs.id = f.movie_id
         WHERE f.user_id = ?`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

module.exports = router;
