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

// Criar lista
router.post('/', (req, res) => {
    const userId = getUserId(req);
    const { nome, descricao } = req.body;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    connection.query(
        "INSERT INTO lista_utilizadores (user_id, nome, descricao) VALUES (?, ?, ?)",
        [userId, nome, descricao],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ id: result.insertId, nome, descricao });
        }
    );
});

// Listar listas do utilizador
router.get('/', (req, res) => {
    const userId = getUserId(req);

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    connection.query(
        "SELECT * FROM lista_utilizadores WHERE user_id = ?",
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

// Adicionar filme à lista
router.post('/:listaId/filmes/:movieId', (req, res) => {
    const userId = getUserId(req);
    const { listaId, movieId } = req.params;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    // Verificar se a lista pertence ao utilizador
    connection.query(
        "SELECT * FROM lista_utilizadores WHERE id = ? AND user_id = ?",
        [listaId, userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length === 0) return res.status(403).json({ error: "Não tens permissão para alterar esta lista." });

            // Inserir filme
            connection.query(
                "INSERT INTO lista_filmes (list_id, movie_id) VALUES (?, ?)",
                [listaId, movieId],
                (err) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ error: "Este filme já está na lista." });
                        }
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({ message: "Filme adicionado à lista!" });
                }
            );
        }
    );
});

// Listar filmes dentro de uma lista
router.get('/:listaId/filmes', (req, res) => {
    const userId = getUserId(req);
    const { listaId } = req.params;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    connection.query(
        `SELECT fs.*
         FROM lista_filmes lf
         JOIN filmes_series fs ON fs.id = lf.movie_id
         WHERE lf.list_id = ?`,
        [listaId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

// Apagar lista
router.delete('/:listaId', (req, res) => {
    const userId = getUserId(req);
    const { listaId } = req.params;

    if (!userId) return res.status(401).json({ error: "Token inválido ou em falta." });

    connection.query(
        "DELETE FROM lista_utilizadores WHERE id = ? AND user_id = ?",
        [listaId, userId],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: "Lista apagada com sucesso!" });
        }
    );
});

module.exports = router;
