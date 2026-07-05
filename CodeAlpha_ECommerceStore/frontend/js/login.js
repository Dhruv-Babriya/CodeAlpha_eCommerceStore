const API = "http://localhost:5000/api/users/login";

document
.getElementById("loginForm")
.addEventListener("submit", loginUser);

async function loginUser(e){

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            email,
            password

        })

    });

    const data = await response.json();

    if(response.ok){

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("isAdmin", data.isAdmin);

    window.location = "index.html";
}else{

        alert(data.message);

    }

}