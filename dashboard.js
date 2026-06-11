const isLoggedIn = localStorage.getItem("isLoggedIn");
const role = localStorage.getItem("role");

// Protect admin dashboard
if (isLoggedIn !== "true" || role !== "admin") {
  window.location.href = "../login.html";
}
