const express = require('express');
const path = require('path');

const app = express();
const PORT = 4200;
const FILES_DIR = path.join(__dirname, 'ui/osu-tourney-irc/browser');

app.use(express.static(FILES_DIR));

function startUIServer(port = PORT) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`UI Server running at http://localhost:${port}/`);
      resolve(server);
    });
    server.on('error', (err) => reject(err));
  });
}

// node ui-server.js
if (require.main === module) {
  startUIServer().catch((err) => {
    console.error('Failed to start UI server:', err);
    process.exit(1);
  });
}

module.exports = { startUIServer };
