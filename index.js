const express = require("express");
const path = require('path');
const serveIndex = require('serve-index')

const app = express();
const port = 3000;

app.use(express.static("public"));
app.get('/', (req, res) => {
  res.sendFile('index.html', {
      root: path.join(__dirname, './public')
  })
})
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
