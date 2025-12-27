const express = require('express');
const router = express.Router();
const connection = require('../database/db');
const { searchMovies, searchSeries } = require('../services/tmdb');


// ======================================================
// 1. IMPORTAR FILME DA TMDB PARA A BASE DE DADOS
// ======================================================
router.post('/import', (req, res) => {
  const { id, nome, sinopse, poster_url, ano_lancamento } = req.body;

  if (!id || !nome) {
    return res.status(400).json({ error: "Dados insuficientes para importar o filme." });
  }

  // Verificar se já existe
  connection.query(
    "SELECT * FROM filmes_series WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length > 0) {
        return res.json({ message: "Filme já existe na base de dados." });
      }

      // Inserir filme com as colunas reais da tua tabela
      connection.query(
        `INSERT INTO filmes_series 
        (id, nome, sinopse, duracao, diretor_id, ano_lancamento, poster_url, trailer_url)
        VALUES (?, ?, ?, NULL, NULL, ?, ?, NULL)`,
        [
          id,               // id TMDB
          nome,             // nome
          sinopse,          // sinopse
          ano_lancamento,   // ano_lancamento
          poster_url        // poster_url
        ],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          res.json({ message: "Filme importado com sucesso!" });
        }
      );
    }
  );
});


// ======================================================
// 2. CRIAR FILME/SÉRIE MANUALMENTE (BACKOFFICE)
// ======================================================
router.post('/', (req, res) => {
  const { nome, sinopse, duracao, diretor_id, ano_lancamento, poster_url, trailer_url } = req.body;

  connection.query(
    `INSERT INTO filmes_series 
    (nome, sinopse, duracao, diretor_id, ano_lancamento, poster_url, trailer_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, sinopse, duracao, diretor_id, ano_lancamento, poster_url, trailer_url],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ id: result.insertId, nome });
    }
  );
});


// ======================================================
// 3. LISTAR FILMES/SÉRIES
// ======================================================
router.get('/', (req, res) => {
  connection.query(
    "SELECT * FROM filmes_series",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(rows);
    }
  );
});


// ======================================================
// 4. PESQUISA VIA TMDB
// ======================================================
router.get('/search', async (req, res) => {
  const { query, type } = req.query;

  try {
    const results = type === "tv"
      ? await searchSeries(query)
      : await searchMovies(query);

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
