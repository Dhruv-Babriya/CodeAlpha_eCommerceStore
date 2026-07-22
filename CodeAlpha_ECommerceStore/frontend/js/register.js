const API = "/api/users/register";

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

    const btn = document.querySelector(".auth-btn");

    btn.innerText = "Please Wait...";

    btn.classList.add("loading");
    
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

    btn.innerText = "Register";

    btn.classList.remove("loading");

    if(response.ok){

        localStorage.setItem("token",data.token);

        localStorage.setItem("userName",data.name);

        showToast("Registration Successful!");

setTimeout(()=>{

    window.location="login.html";

},1200);

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