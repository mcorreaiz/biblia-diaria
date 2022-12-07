const express = require("express");
const { main } = require("./src/index");

const app = express();
const port = 8000;

app.get("*", (req, res) => {
  main(req, res);
});

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
