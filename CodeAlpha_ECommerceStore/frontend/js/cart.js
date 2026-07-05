let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cart-items");

const totalPrice = document.getElementById("total-price");

function displayCart(){

    cartItems.innerHTML = "";

    let total = 0;

    if(cart.length === 0){

        cartItems.innerHTML = "<h2>Your cart is empty.</h2>";

        totalPrice.innerHTML = "Total : ₹0";

        return;

    }

    cart.forEach((item,index)=>{

        total += item.price * item.quantity;

        cartItems.innerHTML += `

        <div class="cart-item">

            <div class="cart-left">

                <img src="https://via.placeholder.com/100">

                <div>

                    <h3>${item.name}</h3>

                    <p>₹${item.price}</p>

                    <p>Quantity : ${item.quantity}</p>

                </div>

            </div>

            <div class="cart-buttons">

                <button onclick="increase(${index})">+</button>

                <button onclick="decrease(${index})">-</button>

                <button onclick="removeItem(${index})">
                    Remove
                </button>

            </div>

        </div>

        `;

    });

    totalPrice.innerHTML = `Total : ₹${total}`;

}

function increase(index){

    cart[index].quantity++;

    saveCart();

}

function decrease(index){

    if(cart[index].quantity > 1){

        cart[index].quantity--;

    }

    saveCart();

}

function removeItem(index){

    cart.splice(index,1);

    saveCart();

}

function saveCart(){

    localStorage.setItem("cart",JSON.stringify(cart));

    displayCart();

}

function continueShopping(){

    window.location="index.html";

}

function checkout(){

    window.location="checkout.html";

}

displayCart();