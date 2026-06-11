// ================= CART DATA =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Random Discount: 1% – 5%
let discountRate = Math.random() * (0.05 - 0.01) + 0.01;

// ================= CURRENCY FORMAT =================
function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(Number(amount));
}

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

    renderCart();

    const cartContainer = document.querySelector(".cart-items-container");
    const checkoutBtn = document.querySelector(".checkout-btn");

    // ================= CART BUTTON EVENTS =================
    cartContainer.addEventListener("click", (e) => {

        const index = e.target.dataset.index;

        if (e.target.classList.contains("plus")) {
            cart[index].qty++;
            renderCart();
        }

        if (e.target.classList.contains("minus")) {
            if (cart[index].qty > 1) {
                cart[index].qty--;
                renderCart();
            }
        }

        if (e.target.classList.contains("remove")) {
            cart.splice(index, 1);
            renderCart();
        }
    });

    // ================= CHECKOUT =================
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {

            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            localStorage.setItem("checkoutSummary", JSON.stringify({
                cart: cart,
                discountRate: discountRate
            }));

            window.location.href = "../payment section/payment.html";
        });
    }
});

// ================= SAFE IMAGE =================
function safeImage(img) {
    if (!img || img === "undefined") {
        return "images/no-image.png";
    }
    return img;
}

// ================= RENDER CART =================
function renderCart() {

    const cartContainer = document.querySelector(".cart-items-container");
    cartContainer.innerHTML = "";

    let subtotal = 0;
    let totalQty = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = `<p class="empty">Your cart is empty</p>`;
        updateSummary(0, 0);
        localStorage.setItem("cart", JSON.stringify(cart));
        return;
    }

    cart.forEach((item, index) => {

        const price = Number(item.price);
        const qty = Number(item.qty);

        const itemTotal = price * qty;
        subtotal += itemTotal;
        totalQty += qty;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-img">
                    <img 
                        src="${safeImage(item.image)}"
                        alt="${item.name}"
                        onerror="this.src='images/no-image.png'"
                    >
                </div>

                <div class="cart-details">
                    <h4 class="product-title">${item.name}</h4>

                    <span class="price">${formatPrice(price)}</span>

                    <div class="qty">
                        <button class="minus" data-index="${index}">−</button>
                        <span class="count">${qty}</span>
                        <button class="plus" data-index="${index}">+</button>
                    </div>

                    <div class="actions">
                        <button class="remove" data-index="${index}">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });

    updateSummary(subtotal, totalQty);
    localStorage.setItem("cart", JSON.stringify(cart));
}

// ================= SUMMARY =================
function updateSummary(subtotal, totalQty) {

    const TAX_RATE = 0.05;
    const SHIPPING_PER_ITEM = 2.00;

    if (subtotal === 0) {
        document.getElementById("summary-subtotal").innerText = formatPrice(0);
        document.getElementById("summary-discount").innerText = `-${formatPrice(0)}`;
        document.getElementById("summary-tax").innerText = formatPrice(0);
        document.getElementById("summary-delivery").innerText = formatPrice(0);
        document.getElementById("summary-total").innerText = formatPrice(0);
        return;
    }

    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * TAX_RATE;
    const shipping = totalQty * SHIPPING_PER_ITEM;
    const total = subtotal - discount + tax + shipping;

    document.getElementById("summary-subtotal").innerText = formatPrice(subtotal);

    const discountPercent = (discountRate * 100).toFixed(1);
    document.getElementById("summary-discount").innerText =
        `-${formatPrice(discount)} (${discountPercent}%)`;

    document.getElementById("summary-tax").innerText = formatPrice(tax);
    document.getElementById("summary-delivery").innerText = formatPrice(shipping);
    document.getElementById("summary-total").innerText = formatPrice(total);
}