if(!localStorage.getItem("token")){

    alert("Please login first");

    window.location="login.html";

}

const container = document.getElementById("orders");

container.innerHTML = `
<div class="order-card">

<h2>Sample Order</h2>

<p>Status : Pending</p>

<p>Total : ₹1598</p>

<p>Payment : Cash On Delivery</p>

</div>
`;