app.get("/", async (req, res) => {
  while (lock) {
    await new Promise(r => setTimeout(r, 10));
  }

  lock = true;

  let count = readCounter();
  count++;
  writeCounter(count);

  lock = false;

  const hostname = req.hostname;
  const port = PORT;
  const serverIp = req.socket.localAddress;
  const clientIp = req.socket.remoteAddress;

  res.send(`
    <html>
      <head>
        <title>Visit Counter</title>
        <style>
          body {
            font-family: Arial;
            background: #f4f4f4;
            padding: 20px;
          }
          .card {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h2 {
            margin-top: 0;
          }
        </style>
      </head>
      <body>

        <div class="card">
          <h2>Visit Counter</h2>
          <p><strong>Visits:</strong> ${count}</p>
        </div>

        <div class="card">
          <h2>Server Info</h2>
          <p><strong>Hostname:</strong> ${hostname}</p>
          <p><strong>Port:</strong> ${port}</p>
          <p><strong>Server IP:</strong> ${serverIp}</p>
        </div>

        <div class="card">
          <h2>Client Info</h2>
          <p><strong>IP:</strong> ${clientIp}</p>
        </div>

      </body>
    </html>
  `);
});