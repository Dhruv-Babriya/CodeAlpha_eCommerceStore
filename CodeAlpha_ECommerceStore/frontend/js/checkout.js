if(!localStorage.getItem("token")){

    alert("Please login first");

    window.location="login.html";

}

const API = "http://localhost:5000/api/orders";

const cart = JSON.parse(localStorage.getItem("cart")) || [];

const total = cart.reduce(
    (sum,item)=>sum+item.price*item.quantity,
    0
);

document.getElementById("orderTotal").innerHTML =
`Total : ₹${total}`;

document.getElementById("checkoutForm")
.addEventListener("submit",placeOrder);

async function placeOrder(e){

    e.preventDefault();

    const token = localStorage.getItem("token");

    const order = {

        products: cart.map(item=>({

            product:item._id,

            quantity:item.quantity

        })),

        totalPrice: total,

        shippingAddress:
            document.getElementById("address").value,

        paymentMethod:
            document.getElementById("payment").value

    };

    const response = await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer "+token
        },

        body:JSON.stringify(order)

    });

    const data = await response.json();

    if(response.ok){

        alert("Order Placed Successfully!");

        localStorage.removeItem("cart");

        window.location="index.html";

    }else{

        alert(data.message);

    }

}