async function carregarPopulares() {
    const filmes = await apiGet("/tmdb/popular");

    for (const filme of filmes) {
        await apiPost("/movies/import", {
            id: filme.id,
            nome: filme.title,
            sinopse: filme.overview,
            poster_url: filme.poster_path,
            ano_lancamento: filme.release_date 
                ? filme.release_date.split("-")[0] 
                : (filme.first_air_date ? filme.first_air_date.split("-")[0] : null)
        });
    }

    const container = document.getElementById("popular");
    container.innerHTML = "";

    filmes.forEach(filme => {
        container.innerHTML += `
            <div class="card">
                <img src="https://image.tmdb.org/t/p/w300${filme.poster_path}">
                <h3>${filme.title}</h3>
                <button onclick="verDetalhes(${filme.id})">Ver detalhes</button>
            </div>
        `;
    });


}

async function carregarDetalhes() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const filme = await apiGet(`/tmdb/details/${id}`);

    document.getElementById("detalhes").innerHTML = `
        <h1>${filme.title}</h1>
        <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}">
        <p>${filme.overview}</p>
        <p><strong>Duração:</strong> ${filme.runtime} min</p>
        <p><strong>Ano:</strong> ${filme.release_date.split("-")[0]}</p>
        <button id="btnFavorito">Adicionar aos Favoritos</button>
    `;
    document.getElementById("btnFavorito").addEventListener("click", () => { 
        adicionarFavorito(filme.id);
    });

}

if (window.location.pathname.includes("filme.html")) {
    carregarDetalhes();
}


function verDetalhes(id) {
    window.location.href = `filme.html?id=${id}`;
}

carregarPopulares();
