const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const FILE = path.join(__dirname, "visits.json");

// Simple mutex to avoid concurrent writes
let lock = false;

function readCounter() {
  try {
    if (!fs.existsSync(FILE)) {
      fs.writeFileSync(FILE, JSON.stringify({ count: 0 }));
    }
    const data = fs.readFileSync(FILE);
    return JSON.parse(data).count;
  } catch (err) {
    console.error("Error reading JSON:", err);
    return 0;
  }
}

function writeCounter(count) {
  try {
    fs.writeFileSync(FILE, JSON.stringify({ count }, null, 2));
  } catch (err) {
    console.error("Error writing JSON:", err);
  }
}

// Main route
app.get("/", async (req, res) => {
  while (lock) await new Promise(r => setTimeout(r, 10));
  lock = true;
  try {
    let count = readCounter();
    count++;
    writeCounter(count);

    const hostname = req.hostname;
    const port = req.socket.localPort;
    const serverIP = req.socket.localAddress;
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    res.send(`
      <h2>Visit Counter</h2>
      <p><strong>Visits:</strong> ${count}</p>
      <hr>
      <h3>Server Info</h3>
      <p><strong>Hostname:</strong> ${hostname}</p>
      <p><strong>Port:</strong> ${port}</p>
      <p><strong>Server IP:</strong> ${serverIP}</p>
      <hr>
      <h3>Client Info</h3>
      <p><strong>IP:</strong> ${clientIP}</p>
    `);
  } finally {
    lock = false;
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});