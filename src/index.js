"use strict";

// Imports dependencies
const axios = require("axios");
const { htmlToText } = require("html-to-text");
const functions = require("@google-cloud/functions-framework");

function main(req, res) {
  const path = req.path;
  switch (path) {
    case "/webhook":
      webhook(req, res);
    case "/test":
      res.send(getEvangelio());
    default:
      res.status(200).send("Server is working");
  }
}

async function webhook(req, res) {
  if (req.method === "POST") {
    // Access token for your app
    // (copy token from DevX getting started page
    // and save it as environment variable into the .env file)
    const token = process.env.WHATSAPP_TOKEN;

    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id =
          req.body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
        if (msg_body === "Biblia") {
          const response = await getEvangelio();
          await axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
              "https://graph.facebook.com/v15.0/" +
              phone_number_id +
              "/messages?access_token=" +
              token,
            data: {
              messaging_product: "whatsapp",
              to: from,
              text: { body: response },
            },
            headers: { "Content-Type": "application/json" },
          });
        } else {
          await axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
              "https://graph.facebook.com/v15.0/" +
              phone_number_id +
              "/messages?access_token=" +
              token,
            data: {
              messaging_product: "whatsapp",
              to: from,
              text: {
                body: "Escríbeme 'Biblia' para recibir las lecturas de hoy!",
              },
            },
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      return res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      return res.sendStatus(404);
    }
  } else if (req.method === "GET") {
    // Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
    // info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  }
}

async function getEvangelio(_date = null) {
  const date =
    _date || new Date().toISOString().split("T")[0].replace(/-/g, "");
  const content = await axios.get(
    `https://feed.evangelizo.org/v2/reader.php?date=${date}&type=all&lang=SP`
  );
  const replace = "*~";
  const converted = htmlToText(content.data, {
    selectors: [
      { selector: "br", format: "inlineString", options: { string: replace } },
    ],
    wordwrap: false,
  });
  let readings = converted.split(replace + replace + replace);
  const [title, firstReading] = readings[0].split(replace + replace);
  readings[0] = firstReading;
  console.log({ readings });
  readings = readings.slice(0, readings.length - 1).map((reading) => {
    const [title, ...readingBody] = reading.split(replace);
    return `${enbold(title)}\n${readingBody.map((r) => r.trim()).join("\n")}`;
  });
  return enbold(title) + "\n\n" + readings.join("\n\n\n");
}

function enbold(string) {
  return "*" + string.trim() + "*";
}
functions.http("main", main);
exports.main = main;
