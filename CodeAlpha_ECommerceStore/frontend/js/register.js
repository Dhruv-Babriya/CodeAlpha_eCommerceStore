const API = "http://localhost:5000/api/users/register";

document
.getElementById("registerForm")
.addEventListener("submit", registerUser);

async function registerUser(e){

    e.preventDefault();

    const name =
        document.getElementById("name").value;

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

            name,
            email,
            password

        })

    });

    const data = await response.json();

    if(response.ok){

        localStorage.setItem("token",data.token);

        localStorage.setItem("userName",data.name);

        alert("Registration Successful!");

        window.location="index.html";

    }else{

        alert(data.message);

    }

}