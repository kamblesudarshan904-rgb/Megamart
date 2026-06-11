// 1. RUN THIS WHEN PAGE LOADS (To show the list)
document.addEventListener("DOMContentLoaded", function() {
    displayProducts();
});

// 2. ADD PRODUCT LOGIC
document.getElementById("productForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const description = document.getElementById("description").value;
    const imageInput = document.getElementById("image");

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const product = {
                name: name,
                price: price,
                image: event.target.result,
                description: description
            };

            let products = JSON.parse(localStorage.getItem("products")) || [];
            products.push(product);
            localStorage.setItem("products", JSON.stringify(products));

            alert("Product Added Successfully!");
            document.getElementById("productForm").reset();
            
            displayProducts(); 
        };
        
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        alert("Please select an image.");
    }
});

// 3. DISPLAY PRODUCTS LOGIC
function displayProducts() {
    const listContainer = document.getElementById("adminProductList");
    let products = JSON.parse(localStorage.getItem("products")) || [];

    listContainer.innerHTML = ""; 

    if (products.length === 0) {
        listContainer.innerHTML = "<p style='text-align:center; color:#888;'>No products added yet.</p>";
        return;
    }

    products.forEach((product, index) => {
        const div = document.createElement("div");
        div.classList.add("product-item");
        
        div.innerHTML = `
            <div style="display:flex; align-items:center;">
                <img src="${product.image}" alt="Product Image">
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <small style="color:#777;">₹${product.price}</small>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteProduct(${index})">Remove</button>
        `;
        listContainer.appendChild(div);
    });
}

// 4. DELETE PRODUCT LOGIC
function deleteProduct(index) {
    if(confirm("Are you sure you want to remove this product?")) {
        let products = JSON.parse(localStorage.getItem("products")) || [];
        
        products.splice(index, 1);
        
        localStorage.setItem("products", JSON.stringify(products));
        
        displayProducts();
    }
}

// 5. LOGOUT LOGIC
function logoutAdmin() {
    localStorage.removeItem("adminLogged");
    window.location.href = "../admin login.html";
}