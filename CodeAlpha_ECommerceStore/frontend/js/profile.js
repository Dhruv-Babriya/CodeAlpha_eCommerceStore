if(!localStorage.getItem("token")){

    alert("Please login first");

    window.location="login.html";

}

const token = localStorage.getItem("token");

if (!token) {
    window.location = "login.html";
}

fetch("http://localhost:5000/api/users/profile", {
    headers: {
        Authorization: "Bearer " + token
    }
})
.then(res => res.json())
.then(user => {

    document.getElementById("username").innerHTML =
        user.name;

    document.getElementById("email").innerHTML =
        user.email;

});

function logout(){

    localStorage.clear();

    window.location="login.html";

}