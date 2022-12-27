"use strict";

// Imports dependencies
if (process.env.NODE_ENV === "dev") {
  require("dotenv").config();
}
const { sendReply, MESSAGES, BUTTON_REPLY } = require("./replies");
const { isWhatsAppMessage, isWhatsAppRequest, genLecturas } = require("./util");

exports.webhookPost = async function (req, res) {
  const token = process.env.WHATSAPP_TOKEN;
  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (isWhatsAppRequest(req)) {
    if (isWhatsAppMessage(req)) {
      // Check the Incoming webhook message
      console.log(JSON.stringify(req.body, null, 2));
      const notif = req.body.entry[0].changes[0].value;
      const phone_number_id = notif.metadata?.phone_number_id;
      notif.messages.forEach(async (msg) => {
        let from = msg?.from;
        if (msg.type === "text") {
          let msg_body = msg?.text?.body;
          console.log({ msg_body });
          sendReply(phone_number_id, token, from, MESSAGES.MAIN_REPLY_BUTTONS);
        } else if (msg.type === "interactive") {
          console.log(msg.interactive.button_reply.id);
          switch (msg.interactive.button_reply.id) {
            case BUTTON_REPLY.LECTURAS:
              sendReply(phone_number_id, token, from, MESSAGES.LECTURAS);
              break;
            case BUTTON_REPLY.ROSARIO:
              sendReply(phone_number_id, token, from, MESSAGES.ROSARIO);
              break;
            default:
              console.error(
                "[webhookPost] Invalid button reply: ",
                msg.interactive.button_reply
              );
              break;
          }
        } else {
          console.error("[webhookPost] Invalid message type: ", msg.type);
        }
      });
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
};

exports.webhookGet = function (req, res) {
  {
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
};

exports.test = async function (_, res) {
  res.send(await genLecturas());
};
