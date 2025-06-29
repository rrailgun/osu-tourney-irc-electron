const express = require('express');
const path = require('path');

const app = express();
const PORT = 4200;

const FILES_DIR = path.join(__dirname, 'ui/osu-tourney-irc/browser');

app.use(express.static(FILES_DIR));

app.listen(PORT, () => {
  console.log(`📁 Serving files from ${FILES_DIR}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/`);
});
