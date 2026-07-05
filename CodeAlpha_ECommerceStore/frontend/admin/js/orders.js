const API = "http://localhost:5000/api/orders";

const table = document.getElementById("orderTable");

async function loadOrders() {

    const response = await fetch(API);

    const orders = await response.json();

    table.innerHTML = "";

    orders.forEach(order => {

        table.innerHTML += `

<tr>

<td>${order.user.name}</td>

<td>₹${order.totalPrice}</td>

<td>

<select onchange="updateStatus('${order._id}',this.value)">

<option ${order.status==="Pending"?"selected":""}>Pending</option>

<option ${order.status==="Processing"?"selected":""}>Processing</option>

<option ${order.status==="Shipped"?"selected":""}>Shipped</option>

<option ${order.status==="Delivered"?"selected":""}>Delivered</option>

</select>

</td>

<td>${order.paymentMethod}</td>

<td>

<button onclick="deleteOrder('${order._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

async function updateStatus(id,status){

    await fetch(`${API}/${id}`,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            status
        })

    });

}

async function deleteOrder(id){

    if(!confirm("Delete Order?")) return;

    await fetch(`${API}/${id}`,{

        method:"DELETE"

    });

    loadOrders();

}

loadOrders();