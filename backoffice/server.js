const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./recursos/rotas/users');
const movieRoutes = require('./recursos/rotas/movies');
const reviewRoutes = require('./recursos/rotas/reviews');
const authRoutes = require('./recursos/rotas/auth');
const favoritosRoutes = require('./recursos/rotas/favoritos');
const listasRoutes = require('./recursos/rotas/listas');
const tmdbRoutes = require('./recursos/rotas/tmdb');
const backofficeRoutes = require('./recursos/rotas/backoffice');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/listas', listasRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/backoffice', backofficeRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});
