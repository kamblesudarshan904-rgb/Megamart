// ================= CURRENCY FORMAT =================
function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(Number(amount));
}

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

    const summaryData = JSON.parse(localStorage.getItem("checkoutSummary"));
    let cart = [];
    let discountRate = 0;

    if (summaryData && summaryData.cart) {
        cart = summaryData.cart;
        discountRate = summaryData.discountRate || 0;
    } else {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    }

    if (cart.length === 0) {
        alert("Your cart is empty! Redirecting to home.");
        window.location.href = "../index.html";
        return;
    }

    let subtotal = 0;
    let totalQty = 0;

    const itemsContainer = document.getElementById("summary-items");
    itemsContainer.innerHTML = "";

    cart.forEach(item => {
        const price = Number(item.price);
        const qty = Number(item.qty);
        const itemTotal = price * qty;
        subtotal += itemTotal;
        totalQty += qty;

        itemsContainer.innerHTML += `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 8px;">
                <img src="${item.image || 'images/no-image.png'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0; font-size: 14px; color: #333;">${item.name}</h4>
                    <small style="color: #777;">Qty: ${qty}</small>
                </div>
                <strong style="font-size: 14px; color: #333;">${formatPrice(itemTotal)}</strong>
            </div>
        `;
    });

    const SHIPPING_PER_ITEM = 2.00;
    const TAX_RATE = 0.05;

    const discount = subtotal * discountRate;
    const tax = (subtotal - discount) * TAX_RATE;
    const shipping = totalQty * SHIPPING_PER_ITEM;
    const finalTotal = subtotal - discount + tax + shipping;

    document.getElementById("product-price").innerText = formatPrice(subtotal);
    document.getElementById("shipping").innerText = formatPrice(shipping);
    document.getElementById("total").innerText = formatPrice(finalTotal);

    // raw values store (no ₹ here)
    window.orderFinalTotal = finalTotal.toFixed(2);
    window.orderCartItems = cart;
});

// ================= HANDLE PAYMENT =================
document.getElementById("payment-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const btn = this.querySelector("button[type='submit']");
    btn.innerText = "Processing...";
    btn.disabled = true;

    const firstName = this.querySelector("input[placeholder='First Name']").value;
    const emailAddress = this.querySelector("input[placeholder='Email Address']").value;

    // ✅ validation
    if (!firstName || !emailAddress) {
        alert("Please enter name and email");
        btn.innerText = "Pay Now";
        btn.disabled = false;
        return;
    }

    // ========== RAZORPAY INTEGRATION ==========
    const options = {
        // 🔑 Step 1: Add your Razorpay Key ID here (Test or Live)
        // Example: key: "89GSOl9TxMM7hZBYg5aflYII"  (Test Key)
        // DO NOT add Secret Key here, only Key ID
        key: "rzp_test_SaItPd00J2fEj8",  

        // Amount in paise (multiply by 100)
        amount: Math.round(window.orderFinalTotal * 100), 
        currency: "INR",
        name: "MegaMart",
        description: "Order Payment",

        // Payment success handler
        handler: function(response) {
            console.log("✅ Razorpay Payment Success:", response);

            // Send email after successful payment
            const emailData = {
                email: emailAddress,
                fullName: firstName,
                orderTotal: window.orderFinalTotal,
                cartItems: window.orderCartItems || [],
                paymentId: response.razorpay_payment_id
            };

            fetch("http://localhost:5000/send-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailData)
            })
            .then(async res => {
                const data = await res.json().catch(() => null);
                console.log("✅ Email sent:", data);

                alert("Payment & Invoice Successful! 🎉");

                localStorage.removeItem("cart");
                localStorage.removeItem("checkoutSummary");

                window.location.href = "../index.html";
            })
            .catch(err => {
                console.error("❌ Email Error:", err);
                alert("Payment Successful! (Email failed)");

                localStorage.removeItem("cart");
                localStorage.removeItem("checkoutSummary");

                window.location.href = "../index.html";
            });
        },

        // Prefill user details in Razorpay popup
        prefill: {
            name: firstName,
            email: emailAddress
        },

        theme: {
            color: "#528FF0"
        }
    };

    // 🔹 Step 2: Open Razorpay checkout
    const rzp = new Razorpay(options);
    rzp.open();

    // Reset button (optional)
    btn.innerText = "Pay Now";
    btn.disabled = false;
});