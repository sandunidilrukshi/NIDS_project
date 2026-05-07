const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const { Parser } = require("json2csv");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// =======================
// DATABASE CONNECTION
// =======================
mongoose.connect("mongodb://127.0.0.1:27017/nids")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB Error:", err));

// =======================
// MODEL
// =======================
const Alert = require("./models/Alert");

// =======================
// HOME ROUTE
// =======================
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

// =======================
// REAL-TIME ALERT SYSTEM
// =======================
setInterval(async () => {
    const suspicious = Math.random() > 0.7;

    if (suspicious) {
        const attackTypes = [
            "DDoS Attack",
            "Port Scan",
            "SQL Injection",
            "Brute Force Attack"
        ];

        const randomAttack =
            attackTypes[Math.floor(Math.random() * attackTypes.length)];

        const alert = new Alert({
            message: randomAttack,
            level: "High Risk"
        });

        await alert.save();

        io.emit("newAlert", alert);

        console.log("Attack Detected:", randomAttack);
    }
}, 5000);

// =======================
// SEARCH LOGS API
// =======================
app.get("/logs/search", async (req, res) => {
    try {
        const q = req.query.q || "";

        const logs = await Alert.find({
            message: { $regex: q, $options: "i" }
        });

        res.json(logs);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Search failed" });
    }
});

// =======================
// EXPORT CSV API
// =======================
app.get("/logs/export", async (req, res) => {
    try {
        const logs = await Alert.find().lean(); // IMPORTANT FIX

        if (!logs || logs.length === 0) {
            return res.status(404).send("No logs found");
        }

        const parser = new Parser();
        const csv = parser.parse(logs);

        res.header("Content-Type", "text/csv");
        res.attachment("nids_logs.csv");
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).send("Export failed");
    }
});

// =======================
// SOCKET CONNECTION
// =======================
io.on("connection", (socket) => {
    console.log("Client connected");
});

// =======================
// START SERVER
// =======================
server.listen(5000, () => {
    console.log("Server running on port 5000");
});