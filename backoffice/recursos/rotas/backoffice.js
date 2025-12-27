const express = require('express');
const router = express.Router();
const connection = require('../database/db');

// ===============================
// UTILIZADORES
// ===============================

// Listar utilizadores
router.get('/utilizadores', (req, res) => {
    connection.query("SELECT id, nome, email, data_registo FROM utilizadores", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Apagar utilizador
router.delete('/utilizadores/:id', (req, res) => {
    connection.query("DELETE FROM utilizadores WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Utilizador apagado com sucesso!" });
    });
});

// ===============================
// GÉNEROS
// ===============================

// Listar géneros
router.get('/generos', (req, res) => {
    connection.query("SELECT * FROM generos", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Criar género
router.post('/generos', (req, res) => {
    const { nome } = req.body;
    connection.query("INSERT INTO generos (nome) VALUES (?)", [nome], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, nome });
    });
});

// Apagar género
router.delete('/generos/:id', (req, res) => {
    connection.query("DELETE FROM generos WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Género apagado!" });
    });
});

// ===============================
// ATORES / DIRETORES
// ===============================

// Listar atores/diretores
router.get('/pessoas', (req, res) => {
    connection.query("SELECT * FROM atores_diretores", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Criar pessoa
router.post('/pessoas', (req, res) => {
    const { nome, tipo } = req.body;
    connection.query(
        "INSERT INTO atores_diretores (nome, tipo) VALUES (?, ?)",
        [nome, tipo],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, nome, tipo });
        }
    );
});

// Apagar pessoa
router.delete('/pessoas/:id', (req, res) => {
    connection.query("DELETE FROM atores_diretores WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Pessoa apagada!" });
    });
});

// ===============================
// FILMES / SÉRIES
// ===============================

// Listar filmes
router.get('/filmes', (req, res) => {
    connection.query("SELECT * FROM filmes_series", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Criar filme
router.post('/filmes', (req, res) => {
    const { nome, sinopse, duracao, ano_lancamento, diretor_id, poster_url, trailer_url } = req.body;

    connection.query(
        `INSERT INTO filmes_series 
        (nome, sinopse, duracao, ano_lancamento, diretor_id, poster_url, trailer_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, sinopse, duracao, ano_lancamento, diretor_id, poster_url, trailer_url],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, nome });
        }
    );
});

// Editar filme
router.put('/filmes/:id', (req, res) => {
    const { nome, sinopse, duracao, ano_lancamento, diretor_id, poster_url, trailer_url } = req.body;

    connection.query(
        `UPDATE filmes_series SET 
        nome=?, sinopse=?, duracao=?, ano_lancamento=?, diretor_id=?, poster_url=?, trailer_url=?
        WHERE id=?`,
        [nome, sinopse, duracao, ano_lancamento, diretor_id, poster_url, trailer_url, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Filme atualizado!" });
        }
    );
});

// Apagar filme
router.delete('/filmes/:id', (req, res) => {
    connection.query("DELETE FROM filmes_series WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Filme apagado!" });
    });
});

// ===============================
// REVIEWS
// ===============================

// Listar reviews
router.get('/reviews', (req, res) => {
    connection.query(
        `SELECT r.*, u.nome AS autor, f.nome AS filme
         FROM reviews r
         JOIN utilizadores u ON u.id = r.user_id
         JOIN filmes_series f ON f.id = r.movie_id`,
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Apagar review
router.delete('/reviews/:id', (req, res) => {
    connection.query("DELETE FROM reviews WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Review apagada!" });
    });
});

module.exports = router;
