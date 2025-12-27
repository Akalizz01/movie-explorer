async function adicionarFavorito(movieId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Tens de fazer login para adicionar favoritos.");
        window.location.href = "login.html";
        return;
    }

    const res = await fetch(API_URL + `/favoritos/${movieId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
    } else {
        alert("Filme adicionado aos favoritos!");
    }
}


async function carregarFavoritos() {
    const token = localStorage.getItem("token");

    const res = await fetch(API_URL + "/favoritos", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const favoritos = await res.json();

    let html = "";

    favoritos.forEach(f => {
        html += `
            <div class="fav-item">
                <img src="https://image.tmdb.org/t/p/w200${f.poster_url}">
                <h3>${f.nome}</h3>
                <button onclick="removerFavorito(${f.id})">Remover</button>
            </div>
        `;
    });

    document.getElementById("listaFavoritos").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", carregarFavoritos);

async function removerFavorito(movieId) {
    const token = localStorage.getItem("token");

    const res = await fetch(API_URL + `/favoritos/${movieId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
    } else {
        alert("Filme removido dos favoritos!");
        carregarFavoritos();
    }
}



