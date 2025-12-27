const API_URL = "http://localhost:3000/api";

// Função para GET
async function apiGet(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    return res.json();
}

// Função para POST
async function apiPost(url, body, token = null) {
    const headers = { "Content-Type": "application/json" };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(API_URL + url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    return res.json();
}


// Função para PUT
async function apiPut(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
}

// Função para DELETE
async function apiDelete(url, token = null) {
    const headers = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(API_URL + url, {
        method: "DELETE",
        headers
    });

    return res.json();
}

