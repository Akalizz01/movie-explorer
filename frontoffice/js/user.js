function atualizarHeader() {
    const userArea = document.getElementById("userArea");
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    // Mostrar / esconder botão Favoritos
    const btnFavoritos = document.getElementById("btnFavoritos");
    if (btnFavoritos) {
        if (token) {
            btnFavoritos.style.display = "inline-block";
        } else {
            btnFavoritos.style.display = "none";
        }
    }

    // Atualizar área do utilizador
    if (user && token) {
        userArea.innerHTML = `
            <span>Olá, ${user.nome}</span>
            <button id="logoutBtn">Logout</button>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });

    } else {
        userArea.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Registar</a>
        `;
    }
}

document.addEventListener("DOMContentLoaded", atualizarHeader);
