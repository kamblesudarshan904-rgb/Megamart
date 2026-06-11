const loginCard = document.getElementById("loginCard");
const signupCard = document.getElementById("signupCard");

// ================= UI SWITCHING =================
function showSignup() {
  loginCard.classList.remove("active");
  signupCard.classList.add("active");
}

function showLogin() {
  signupCard.classList.remove("active");
  loginCard.classList.add("active");
}

function goToAdminLogin() {
  window.location.href = "admin login.html";
}

// ================= 1. HANDLE SIGNUP =================
document.getElementById("signupBtn").addEventListener("click", () => {
    const fullName = document.getElementById("regFullName").value;
    const username = document.getElementById("regUser").value;
    const email = document.getElementById("regEmail").value;
    const mobile = document.getElementById("regMobile").value;
    const password = document.getElementById("regPass").value;

    if (!fullName || !username || !email || !password) {
        alert("Please fill in all required fields!");
        return;
    }

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, mobile, password })
    })
    .then(async res => {
        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
            throw new Error("Server response error");
        }

        return data;
    })
    .then(data => {
        if (data.status === "Success") {
            alert("Registration Successful! Please Login.");
            showLogin();
        } else {
            alert(data.error || "Signup failed");
        }
    })
    .catch(err => {
        console.error("❌ Signup Error:", err);
        alert("Signup failed (Check console)");
    });
});

// ================= 2. HANDLE LOGIN =================
document.getElementById("loginBtn").addEventListener("click", () => {
    const username = document.getElementById("loginUser").value;
    const password = document.getElementById("loginPass").value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(async res => {
        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
            throw new Error("Server response error");
        }

        return data;
    })
    .then(data => {
        if (data.status === "Success") {
            alert("Login Successful! Welcome " + data.fullName);

            localStorage.setItem("userLogged", "true");
            localStorage.setItem("username", username);
            localStorage.setItem("fullName", data.fullName);

            window.location.href = "index.html";
        } else {
            alert(data.error || "Login failed");
        }
    })
    .catch(err => {
        console.error("❌ Login Error:", err);
        alert("Login failed (Check console)");
    });
});