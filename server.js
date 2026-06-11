const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const rateLimit = require("express-rate-limit"); // ✅ ADD

const app = express();

// ✅ SECURITY MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "10kb" })); // ✅ payload limit

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: "Too many requests, try later"
});
app.use(limiter);

// ================= ROOT TEST =================
app.get("/", (req, res) => {
    res.send("✅ Server is running perfectly");
});

// ================= DATABASE =================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'megamart_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ DB Error:', err);
    } else {
        console.log('✅ Connected to MySQL Database');
    }
});

// ✅ LOGIN ATTEMPTS TRACK
let loginAttempts = {};

// ================= REGISTER API =================
app.post("/register", async (req, res) => {
    const { fullName, username, email, mobile, password } = req.body;

    // ✅ ADD VALIDATION
    if (!fullName || fullName.length > 50) {
        return res.json({ error: "Invalid full name" });
    }

    if (!username || username.length > 20) {
        return res.json({ error: "Invalid username" });
    }

    if (!email || !email.includes("@")) {
        return res.json({ error: "Invalid email" });
    }

    if (!password || password.length < 6) {
        return res.json({ error: "Password must be 6+ chars" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
        if (err) return res.status(500).json({ error: "DB error" });

        if (result.length > 0) {
            return res.json({ error: "Username already taken" });
        }

        db.query(
            "INSERT INTO users (full_name, username, email, mobile, password) VALUES (?, ?, ?, ?, ?)",
            [fullName, username, email, mobile, hashedPassword],
            (err) => {
                if (err) return res.status(500).json({ error: "DB insert error" });

                res.json({ status: "Success" });
            }
        );
    });
});

// ================= LOGIN API =================
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const userIP = req.ip;

    // ✅ ADD BRUTE FORCE PROTECTION
    if (loginAttempts[userIP] > 10) {
        return res.status(429).json({ error: "Too many attempts" });
    }

    if (!username || !password) {
        return res.json({ error: "Enter username & password" });
    }

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
        if (err) return res.status(500).json({ error: "DB error" });

        if (result.length === 0) {
            return res.json({ error: "User not found" });
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            loginAttempts[userIP] = 0; // ✅ reset
            res.json({
                status: "Success",
                fullName: user.full_name
            });
        } else {
            loginAttempts[userIP] = (loginAttempts[userIP] || 0) + 1; // ✅ increment
            res.json({ error: "Wrong password" });
        }
    });
});

// ================= EMAIL API =================
app.post('/send-invoice', async (req, res) => {

    console.log("🔥 API HIT झाला!");

    const { email, fullName, orderTotal, cartItems } = req.body;

    if (!email || !email.includes("@")) {
        return res.json({ error: "Invalid email" });
    }

    if (!orderTotal || orderTotal <= 0) {
        return res.json({ error: "Invalid amount" });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "kamblesudarshan904@gmail.com",
            pass: "wpshmzrvwbcprspe"
        }
    });

    function formatPrice(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(Number(amount));
    }

    // ================= NEW BILL LOGIC =================
    let subtotal = 0;

    (cartItems || []).forEach(item => {
        subtotal += item.price * item.qty;
    });

    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    // ================= TABLE ROWS =================
    let rows = "";

    (cartItems || []).forEach(item => {
        rows += `
        <tr>
            <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
            <td style="padding:8px;border:1px solid #ddd;">${formatPrice(item.price)}</td>
            <td style="padding:8px;border:1px solid #ddd;">${item.qty}</td>
            <td style="padding:8px;border:1px solid #ddd;">${formatPrice(item.price * item.qty)}</td>
        </tr>`;
    });

    try {
        await transporter.sendMail({
    from: '"MegaMart" <kamblesudarshan904@gmail.com>',
    to: email,
    subject: "🧾 MegaMart Invoice",
    html: `
    <div style="font-family:Arial,sans-serif; max-width:700px; margin:auto; border:1px solid #ddd; padding:20px;">

        <h2 style="text-align:center; color:#333;">🧾 MegaMart Invoice</h2>

        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
            <thead>
                <tr style="background:#333; color:#fff;">
                    <th style="padding:10px; border:1px solid #ddd;">Product</th>
                    <th style="padding:10px; border:1px solid #ddd;">Price</th>
                    <th style="padding:10px; border:1px solid #ddd;">Qty</th>
                    <th style="padding:10px; border:1px solid #ddd;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <table style="width:100%; margin-top:20px; border-collapse:collapse;">
            <tr>
                <td style="padding:10px;">Subtotal</td>
                <td style="padding:10px; text-align:right;">${formatPrice(subtotal)}</td>
            </tr>

            <tr>
                <td style="padding:10px;">GST (18%)</td>
                <td style="padding:10px; text-align:right;">${formatPrice(taxAmount)}</td>
            </tr>

            <tr style="background:#f5f5f5; font-weight:bold;">
                <td style="padding:10px;">Grand Total</td>
                <td style="padding:10px; text-align:right;">${formatPrice(grandTotal)}</td>
            </tr>
        </table>

        <p style="text-align:center; margin-top:30px; color:#777;">
            Thank you for shopping with MegaMart ❤️
        </p>

    </div>
    `
});
        console.log("✅ Email Sent");

    } catch (error) {
        console.error("❌ Email Failed:", error.message);
    }

    res.json({ status: "Success" });
});
// ================= AI SUGGESTION API =================

// 👉 Dummy product data (future madhe DB madhun gheu shakto)
const products = [
    { id: 1, name: "iPhone", category: "electronics" },
    { id: 2, name: "Samsung TV", category: "electronics" },
    { id: 3, name: "Shoes", category: "fashion" },
    { id: 4, name: "T-Shirt", category: "fashion" },
    { id: 5, name: "Headphones", category: "electronics" }
];

// 👉 User activity store (temporary - memory madhe)
let userHistory = {};

// ================= SAVE USER ACTIVITY =================
app.post("/track", (req, res) => {
    const { userId, category } = req.body;

    if (!userHistory[userId]) {
        userHistory[userId] = [];
    }

    userHistory[userId].push(category);

    res.json({ status: "Tracked" });
});

// ================= GET AI RECOMMENDATION =================
app.get("/api/recommend/:userId", (req, res) => {
    const userId = req.params.userId;

    const history = userHistory[userId];

    if (!history || history.length === 0) {
        return res.json({ message: "No data", data: [] });
    }

    // 👉 last viewed category
    const lastCategory = history[history.length - 1];

    const recommended = products.filter(p => p.category === lastCategory);

    res.json({
        basedOn: lastCategory,
        data: recommended
    });
});

// ================= SAVE ORDER WITH ITEMS =================
app.post("/order", (req, res) => {
    const { userName, totalAmount, cartItems } = req.body;

    if (!userName || !totalAmount) {
        return res.json({ error: "Invalid order data" });
    }

    // 👉 cart items JSON madhe convert
    const items = JSON.stringify(cartItems || []);

    db.query(
        "INSERT INTO orders (user_name, total_amount, status, items) VALUES (?, ?, ?, ?)",
        [userName, totalAmount, "Placed", items],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "DB error" });
            }

            res.json({ status: "Order Saved" });
        }
    );
});


// ================= ADMIN - ALL ORDERS =================
app.get("/admin/orders", (req, res) => {

    db.query(
        "SELECT * FROM orders ORDER BY date DESC",
        (err, result) => {
            if (err) return res.status(500).json({ error: "DB error" });

            // 👉 items JSON parse kar
            const formatted = result.map(order => ({
                ...order,
                items: order.items ? JSON.parse(order.items) : []
            }));

            res.json(formatted);
        }
    );
});

// ================= SAVE ORDER =================
app.post("/order", (req, res) => {
    const { userName, totalAmount, cartItems } = req.body;

    if (!userName || !totalAmount) {
        return res.json({ error: "Invalid order data" });
    }

    const items = JSON.stringify(cartItems || []);

    db.query(
        "INSERT INTO orders (user_name, total_amount, status, items) VALUES (?, ?, ?, ?)",
        [userName, totalAmount, "Placed", items],
        (err) => {
            if (err) return res.status(500).json({ error: "DB error" });

            res.json({ status: "Order Saved" });
        }
    );
});

// ================= SERVER =================
app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
});