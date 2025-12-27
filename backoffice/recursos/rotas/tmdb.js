const express = require('express');
const router = express.Router();
const axios = require('axios');
const connection = require('../database/db');
const { apiKey } = require('../services/tmdb');

// Função para inserir género se não existir
function insertGenre(name) {
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT IGNORE INTO generos (nome) VALUES (?)",
            [name],
            (err) => {
                if (err) return reject(err);

                connection.query(
                    "SELECT id FROM generos WHERE nome = ?",
                    [name],
                    (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows[0].id);
                    }
                );
            }
        );
    });
}

// Função para inserir ator/diretor
function insertPerson(name, tipo) {
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT IGNORE INTO atores_diretores (nome, tipo) VALUES (?, ?)",
            [name, tipo],
            (err) => {
                if (err) return reject(err);

                connection.query(
                    "SELECT id FROM atores_diretores WHERE nome = ? AND tipo = ?",
                    [name, tipo],
                    (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows[0].id);
                    }
                );
            }
        );
    });
}

// ===============================
// 🔍 PESQUISAR FILMES
// ===============================
router.get('/search/movie', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: "Falta o parâmetro 'query'." });
    }

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/movie`,
            {
                params: {
                    api_key: apiKey,
                    query: query,
                    language: 'pt-PT'
                }
            }
        );

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// 🔍 PESQUISAR SÉRIES
// ===============================
router.get('/search/series', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: "Falta o parâmetro 'query'." });
    }

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/tv`,
            {
                params: {
                    api_key: apiKey,
                    query: query,
                    language: 'pt-PT'
                }
            }
        );

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// ⭐ FILMES POPULARES
// ===============================
router.get('/popular', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/popular`,
            {
                params: {
                    api_key: apiKey,
                    language: 'pt-PT',
                    page: 1
                }
            }
        );

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// 🎬 IMPORTAR FILME POR ID
// ===============================
router.get('/import/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        // Buscar detalhes do filme
        const movieRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=pt-PT`
        );

        const creditsRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=pt-PT`
        );

        const movie = movieRes.data;
        const credits = creditsRes.data;

        // Diretor
        const diretor = credits.crew.find(p => p.job === "Director");
        let diretorId = null;

        if (diretor) {
            diretorId = await insertPerson(diretor.name, "diretor");
        }

        // Inserir filme
        connection.query(
            `INSERT INTO filmes_series 
            (nome, sinopse, duracao, ano_lancamento, poster_url, trailer_url, diretor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                movie.title,
                movie.overview,
                movie.runtime,
                movie.release_date?.split("-")[0],
                `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                null,
                diretorId
            ],
            async (err, result) => {
                if (err) return res.status(500).json({ error: err.message });

                const newMovieId = result.insertId;

                // Inserir géneros
                for (const g of movie.genres) {
                    const genreId = await insertGenre(g.name);

                    connection.query(
                        "INSERT INTO genero_filme (movie_id, genre_id) VALUES (?, ?)",
                        [newMovieId, genreId]
                    );
                }

                // Inserir elenco (primeiros 10)
                for (const actor of credits.cast.slice(0, 10)) {
                    const actorId = await insertPerson(actor.name, "ator");

                    connection.query(
                        "INSERT INTO movie_cast (movie_id, actor_id) VALUES (?, ?)",
                        [newMovieId, actorId]
                    );
                }

                res.json({
                    message: "Filme importado com sucesso!",
                    movie_id: newMovieId,
                    nome: movie.title
                });
            }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// 🎥 DETALHES COMPLETOS DO FILME
// ===============================
router.get('/details/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}`,
            {
                params: {
                    api_key: apiKey,
                    language: 'pt-PT',
                    append_to_response: 'videos,credits'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// 🔄 ATUALIZAR FILME IMPORTADO
// ===============================
router.put('/update/:id', async (req, res) => {
    const localMovieId = req.params.id;

    try {
        // Buscar o ID TMDB do filme na BD
        connection.query(
            "SELECT nome FROM filmes_series WHERE id = ?",
            [localMovieId],
            async (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                if (rows.length === 0) return res.status(404).json({ error: "Filme não encontrado na BD." });

                const movieName = rows[0].nome;

                // Procurar filme na TMDB pelo nome
                const searchRes = await axios.get(
                    `https://api.themoviedb.org/3/search/movie`,
                    {
                        params: {
                            api_key: apiKey,
                            query: movieName,
                            language: 'pt-PT'
                        }
                    }
                );

                if (searchRes.data.results.length === 0) {
                    return res.status(404).json({ error: "Filme não encontrado na TMDB." });
                }

                const tmdbId = searchRes.data.results[0].id;

                // Buscar detalhes atualizados
                const movieRes = await axios.get(
                    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=pt-PT`
                );

                const movie = movieRes.data;

                // Atualizar filme
                connection.query(
                    `UPDATE filmes_series SET 
                        nome = ?, 
                        sinopse = ?, 
                        duracao = ?, 
                        ano_lancamento = ?, 
                        poster_url = ?
                    WHERE id = ?`,
                    [
                        movie.title,
                        movie.overview,
                        movie.runtime,
                        movie.release_date?.split("-")[0],
                        `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                        localMovieId
                    ],
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });

                        res.json({ message: "Filme atualizado com sucesso!" });
                    }
                );
            }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// 🔥 FILMES EM ALTA (TRENDING)
// ===============================
router.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/trending/movie/week`,
            {
                params: {
                    api_key: apiKey,
                    language: 'pt-PT'
                }
            }
        );

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// ⭐ FILMES MAIS BEM AVALIADOS
// ===============================
router.get('/toprated', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/top_rated`,
            {
                params: {
                    api_key: apiKey,
                    language: 'pt-PT',
                    page: 1
                }
            }
        );

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;
