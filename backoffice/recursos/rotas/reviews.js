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

// Criar review
router.post('/:movieId', (req, res) => {
    const userId = getUserId(req);
    const { movieId } = req.params;
    const { classificacao, critica } = req.body;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    connection.query(
        "INSERT INTO reviews (user_id, movie_id, classificacao, critica) VALUES (?, ?, ?, ?)",
        [userId, movieId, classificacao, critica],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
                id: result.insertId,
                user_id: userId,
                movie_id: movieId,
                classificacao,
                critica
            });
        }
    );
});

// Editar review
router.put('/:reviewId', (req, res) => {
    const userId = getUserId(req);
    const { reviewId } = req.params;
    const { classificacao, critica } = req.body;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    // Verificar se a review pertence ao utilizador
    connection.query(
        "SELECT * FROM reviews WHERE id = ? AND user_id = ?",
        [reviewId, userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length === 0) return res.status(403).json({ error: "Não tens permissão para editar esta review." });

            connection.query(
                "UPDATE reviews SET classificacao = ?, critica = ? WHERE id = ?",
                [classificacao, critica, reviewId],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.json({ message: "Review atualizada com sucesso!" });
                }
            );
        }
    );
});

// Apagar review
router.delete('/:reviewId', (req, res) => {
    const userId = getUserId(req);
    const { reviewId } = req.params;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    connection.query(
        "DELETE FROM reviews WHERE id = ? AND user_id = ?",
        [reviewId, userId],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: "Review apagada com sucesso!" });
        }
    );
});

// Listar reviews de um filme
router.get('/movie/:movieId', (req, res) => {
    const { movieId } = req.params;

    connection.query(
        `SELECT r.*, u.nome AS autor
         FROM reviews r
         JOIN utilizadores u ON u.id = r.user_id
         WHERE r.movie_id = ?
         ORDER BY r.data_review DESC`,
        [movieId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

// Votar utilidade
router.post('/vote/:reviewId', (req, res) => {
    const userId = getUserId(req);
    const { reviewId } = req.params;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    // Impedir votos duplicados (tabela opcional)
    connection.query(
        "SELECT * FROM review_votes WHERE user_id = ? AND review_id = ?",
        [userId, reviewId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            if (rows.length > 0) {
                return res.status(400).json({ error: "Já votaste nesta review." });
            }

            // Registar voto
            connection.query(
                "INSERT INTO review_votes (user_id, review_id) VALUES (?, ?)",
                [userId, reviewId]
            );

            // Incrementar votos_utilidade
            connection.query(
                "UPDATE reviews SET votos_utilidade = votos_utilidade + 1 WHERE id = ?",
                [reviewId],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.json({ message: "Voto registado com sucesso!" });
                }
            );
        }
    );
});

module.exports = router;
