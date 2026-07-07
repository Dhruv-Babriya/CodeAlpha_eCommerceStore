const token = localStorage.getItem("token");
const isAdmin = localStorage.getItem("isAdmin");

if (!token || isAdmin !== "true") {
    console.warn("Admin access denied; redirecting to login page.");
    window.location.replace("../login.html");
}