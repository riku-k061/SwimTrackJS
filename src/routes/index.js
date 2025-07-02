// src/routes/index.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const registerRoutes = app => {
  const baseDir = __dirname;
  const versions = fs.readdirSync(baseDir, { withFileTypes:true })
    .filter(d => d.isDirectory() && d.name.startsWith('v'))
    .map(d => d.name);

  versions.forEach(v => {
    const router = express.Router();
    const dir = path.join(baseDir, v);
    fs.readdirSync(dir)
      .filter(f => f.endsWith('.js') && f!=='index.js')
      .forEach(file => {
        const name = path.basename(file, '.js');
        const route = require(path.join(dir, file));
        router.use(`/${name}`, route);
      });
    app.use(`/${v}`, router);
  });
};

module.exports = { registerRoutes };
