const API = "/api/users/login";

document
.getElementById("loginForm")
.addEventListener("submit", loginUser);

async function loginUser(e){

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const btn=document.querySelector(".auth-btn");

    btn.innerText="Please Wait...";

    btn.classList.add("loading");
    
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

    btn.innerText = "Login";

    btn.classList.remove("loading");

if(response.ok){

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");

    showToast("Login Successful!");

    setTimeout(() => {

        // If user tried to access admin page, redirect back. Otherwise go to website home.
        const redirectTo = localStorage.getItem("postLoginRedirect") || "index.html";
        localStorage.removeItem("postLoginRedirect");
        window.location = redirectTo;

    }, 1000);

}else{

    showToast(data.message,true);

}

}


function togglePassword(){

const password=document.getElementById("password");

if(password.type==="password"){

password.type="text";

}else{

password.type="password";

}

}

function showToast(message,isError=false){

const toast=document.createElement("div");

toast.className=isError?"toast error":"toast";

toast.innerText=message;

document.body.appendChild(toast);

setTimeout(()=>{

toast.remove();

},3000);

}