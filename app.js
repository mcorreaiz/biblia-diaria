const express = require("express");
const functions = require("@google-cloud/functions-framework");
const body_parser = require("body-parser");
const { webhookGet, webhookPost, test } = require("./src");

const app = express(body_parser.json());

app.use(body_parser.json());

app.get("/webhook", webhookGet);

app.post("/webhook", webhookPost);

app.get("/test", test);

app.get("*", (_, res) => {
  res.status(200).send("Server is working");
});

functions.http("main", app);
exports.main = app;
