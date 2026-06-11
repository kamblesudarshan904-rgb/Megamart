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
        console.error("❌ Signup Error (trying LocalStorage fallback):", err);
        
        try {
            let localUsers = JSON.parse(localStorage.getItem("local_users")) || [];
            
            // Check if username already exists
            const userExists = localUsers.some(u => u.username === username);
            if (userExists) {
                alert("Username already taken (Local Database)");
                return;
            }
            
            // Save user
            localUsers.push({ fullName, username, email, mobile, password });
            localStorage.setItem("local_users", JSON.stringify(localUsers));
            
            alert("Registration Successful (Local Database Fallback)! Please Login.");
            showLogin();
        } catch (localErr) {
            console.error("❌ LocalStorage Error:", localErr);
            alert("Signup failed (Check console)");
        }
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
        console.error("❌ Login Error (trying LocalStorage fallback):", err);
        
        try {
            // Support default test account for live demo
            if (username === "ss" && password === "123") {
                alert("Login Successful (Local Database Fallback)! Welcome ss");
                localStorage.setItem("userLogged", "true");
                localStorage.setItem("username", "ss");
                localStorage.setItem("fullName", "ss");
                window.location.href = "index.html";
                return;
            }

            let localUsers = JSON.parse(localStorage.getItem("local_users")) || [];
            
            // Find user
            const user = localUsers.find(u => u.username === username && u.password === password);
            
            if (user) {
                alert("Login Successful (Local Database Fallback)! Welcome " + user.fullName);
                
                localStorage.setItem("userLogged", "true");
                localStorage.setItem("username", username);
                localStorage.setItem("fullName", user.fullName);
                
                window.location.href = "index.html";
            } else {
                alert("Invalid Username or Password (Local Database)");
            }
        } catch (localErr) {
            console.error("❌ LocalStorage Error:", localErr);
            alert("Login failed (Check console)");
        }
    });
});