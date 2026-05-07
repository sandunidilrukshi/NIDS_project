// =======================
// SOCKET CONNECTION
// =======================
const socket = io();


// =======================
// DARK MODE
// =======================
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}


// =======================
// STATS SYSTEM
// =======================
let stats = {
    totalThreats: 0,
    highRisk: 0,
    portScans: 0
};

function updateStatsUI() {
    document.getElementById("totalThreats").innerText = stats.totalThreats;
    document.getElementById("highRisk").innerText = stats.highRisk;
    document.getElementById("portScans").innerText = stats.portScans;
}


// =======================
// ATTACK COLOR SYSTEM
// =======================
function getAttackColor(message) {

    if (message === "DDoS Attack") {
        return { border: "red", bg: "#ffe5e5" };
    }

    if (message === "Port Scan") {
        return { border: "orange", bg: "#fff3cd" };
    }

    if (message === "SQL Injection") {
        return { border: "purple", bg: "#f3e8ff" };
    }

    if (message === "Brute Force Attack") {
        return { border: "blue", bg: "#dbeafe" };
    }

    return { border: "gray", bg: "#f1f1f1" };
}


// =======================
// SEARCH LOGS
// =======================
async function searchLogs() {

    const q = document.getElementById("search").value;

    const res = await fetch(`/logs/search?q=${q}`);
    const data = await res.json();

    displayLogs(data);
}


// =======================
// DISPLAY LOGS
// =======================
function displayLogs(logs) {

    const container = document.getElementById("alerts");
    container.innerHTML = "";

    if (!logs || logs.length === 0) {
        container.innerHTML = `<div class="alert-item">No logs found</div>`;
        return;
    }

    logs.forEach(log => {

        const div = document.createElement("div");
        div.classList.add("alert-item");

        const color = getAttackColor(log.message);

        div.style.borderLeft = `6px solid ${color.border}`;
        div.style.background = color.bg;

        div.innerHTML = `
            <h5>${log.message}</h5>
            <p>${log.level}</p>
        `;

        container.appendChild(div);
    });
}


// =======================
// CHART VARIABLES
// =======================
let ddosCount = 0;
let portScanCount = 0;
let sqlCount = 0;
let bruteForceCount = 0;


// =======================
// CHART SETUP
// =======================
const ctx = document.getElementById("attackChart");

const attackChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: [
            "DDoS",
            "Port Scan",
            "SQL Injection",
            "Brute Force"
        ],
        datasets: [{
            label: "Detected Attacks",
            data: [0, 0, 0, 0],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});


// =======================
// REAL-TIME ALERTS
// =======================
socket.on("newAlert", (data) => {

    const container = document.getElementById("alerts");

    const div = document.createElement("div");
    div.classList.add("alert-item");

    const color = getAttackColor(data.message);

    div.style.borderLeft = `6px solid ${color.border}`;
    div.style.background = color.bg;

    div.innerHTML = `
        <h5>${data.message}</h5>
        <p>${data.level}</p>
    `;

    container.prepend(div);


    // =======================
    // UPDATE STATS
    // =======================
    stats.totalThreats++;

    if (data.level === "High Risk") {
        stats.highRisk++;
    }

    if (data.message === "Port Scan") {
        stats.portScans++;
    }

    updateStatsUI();


    // =======================
    // UPDATE CHART
    // =======================
    if (data.message === "DDoS Attack") ddosCount++;
    if (data.message === "Port Scan") portScanCount++;
    if (data.message === "SQL Injection") sqlCount++;
    if (data.message === "Brute Force Attack") bruteForceCount++;

    attackChart.data.datasets[0].data = [
        ddosCount,
        portScanCount,
        sqlCount,
        bruteForceCount
    ];

    attackChart.update();
});