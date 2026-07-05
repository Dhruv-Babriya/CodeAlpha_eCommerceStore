const token = localStorage.getItem("token");
const isAdmin = localStorage.getItem("isAdmin");

if (!token || isAdmin !== "true") {
    alert("Access Denied!");
    window.location = "../login.html";
}