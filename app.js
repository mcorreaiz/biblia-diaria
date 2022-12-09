const express = require("express");
const functions = require("@google-cloud/functions-framework");
const { webhookGet, webhookPost, test } = require("./src");

const app = express();

app.get("/webhook", webhookGet);

app.post("/webhook", webhookPost);

app.get("/test", test);

app.get("*", (_, res) => {
  res.status(200).send("Server is working");
});

functions.http("main", app);
exports.main = app;
