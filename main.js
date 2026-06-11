document.addEventListener("DOMContentLoaded", () => {
    
    // 1. HAMBURGER MENU
    const hamburger = document.querySelector(".hamburger");
    const navlist = document.querySelector(".navlist");
    if (hamburger && navlist) {
        hamburger.addEventListener("click", () => {
            navlist.classList.toggle("active");
        });
    }

    // 2. SEARCH BOX
    const searchIcon = document.querySelector("#search-icon");
    const searchBox = document.querySelector(".search-box");
    const closeSearchBtn = document.querySelector(".close-search");

    if (searchIcon && searchBox) {
        searchIcon.addEventListener("click", (e) => {
            e.preventDefault();
            searchBox.classList.toggle("active");
            if (searchBox.classList.contains("active")) {
                searchBox.querySelector("input").focus();
            }
        });
        if (closeSearchBtn) {
            closeSearchBtn.addEventListener("click", () => {
                searchBox.classList.remove("active");
            });
        }
    }

    // 3. LOAD ADMIN PRODUCTS
    const container = document.getElementById("productContainer");
    if (container) {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "card New";
            
            const price = parseFloat(product.price).toFixed(2);

            card.innerHTML = `
                <div class="new"></div>
                <img src="${product.image}" alt="${product.name}">
                <div class="card-content">
                    <p class="title">${product.name}</p>
                    <div class="price">
                        <span class="amount">₹${price}</span>
                    </div>
                    <button class="add-to-cart">Add To Cart</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // 4. SEARCH FILTER
    const searchInput = document.querySelector(".search-box input");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const filter = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll(".card");
            cards.forEach(card => {
                const title = card.querySelector(".title");
                if (title) {
                    const text = title.innerText.toLowerCase();
                    card.style.display = text.includes(filter) ? "" : "none";
                }
            });
        });
    }
});

// ===========================
// 5. GLOBAL ADD TO CART
// ===========================
document.addEventListener("click", function(e) {
    const btn = e.target.closest(".add-to-cart");

    if (btn) {
        e.preventDefault();

        const card = btn.closest(".card");
        if (!card) return;

        const imgElement = card.querySelector("img");
        const titleElement = card.querySelector(".title");
        const priceElement = card.querySelector(".amount");

        if (!imgElement || !titleElement || !priceElement) {
            console.error("Error: Missing product info");
            return;
        }

        // IMAGE PATH FIX
        let finalImageSrc = imgElement.getAttribute("src");

        if (!finalImageSrc.startsWith("data:") && !finalImageSrc.startsWith("http")) {
            if (!finalImageSrc.startsWith("../")) {
                finalImageSrc = `../${finalImageSrc}`;
            }
        }

        const priceText = priceElement.innerText.replace(/[^\d.]/g, '');
        const price = parseFloat(priceText);

        const product = {
            image: finalImageSrc,
            name: titleElement.innerText.trim(),
            price: price,
            qty: 1
        };

        addItemToCart(product);
    }
});

function addItemToCart(product) {
    try {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingIndex = cart.findIndex(item => item.name === product.name);

        if (existingIndex > -1) {
            cart[existingIndex].qty += 1;
            alert(`${product.name} quantity updated!`);
        } else {
            cart.push(product);
            alert(`${product.name} added to cart!`);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
        if (error.name === "QuotaExceededError") {
            alert("Error: Storage Full! The product image is too large. Please delete some items or use smaller images.");
        } else {
            console.error(error);
        }
    }
}