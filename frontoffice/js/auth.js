// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await apiPost("/auth/login", { email, password });

            if (res.error) {
                alert(res.error);
                return;
            }

            // Guardar token e user
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));

            window.location.href = "index.html";

        } catch (err) {
            console.error(err);
            alert("Erro ao fazer login");
        }
    });
}



// REGISTO
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await apiPost("/auth/register", { nome, email, password });

            if (res.error) {
                alert(res.error);
                return;
            }

            alert("Conta criada com sucesso! Já podes fazer login.");
            window.location.href = "login.html";

        } catch (err) {
            console.error(err);
            alert("Erro ao criar conta");
        }
    });
}
