const axios = require("axios");
const { genLecturas } = require("./util");

exports.BUTTON_REPLY = Object.freeze({
  ROSARIO: "ROSARIO",
  LECTURAS: "LECTURAS",
});

exports.MESSAGES = Object.freeze({
  MAIN_REPLY_BUTTONS: "MAIN_REPLY_BUTTONS",
  LECTURAS: "LECTURAS",
});

const mainReplyButtonsDataFn = (recipient) => {
  return {
    messaging_product: "whatsapp",
    to: recipient,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "Hola, soy un robot que te ayuda a rezar. Qué necesitas?",
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: exports.BUTTON_REPLY.LECTURAS,
              title: "Lecturas de Hoy",
            },
          },
          {
            type: "reply",
            reply: {
              id: exports.BUTTON_REPLY.ROSARIO,
              title: "Rosario de Hoy",
            },
          },
        ],
      },
    },
  };
};

const lecturasDataFn = async (recipient) => {
  return {
    messaging_product: "whatsapp",
    to: recipient,
    text: { body: await genLecturas() },
  };
};

const rosarioDataFn = async (recipient) => {
  return {
    messaging_product: "whatsapp",
    to: recipient,
    text: { body: "Opcion no disponible por ahora. Lo siento!" },
  };
};

exports.sendReply = async (phone_id, token, recipient, message) => {
  let dataFn;
  switch (message) {
    case this.MESSAGES.MAIN_REPLY_BUTTONS:
      dataFn = mainReplyButtonsDataFn;
      break;
    case this.MESSAGES.LECTURAS:
      dataFn = lecturasDataFn;
      break;
    case this.MESSAGES.ROSARIO:
      dataFn = rosarioDataFn;
      break;
    default:
      console.error("[sendAxios] Invalid message: ", message);
      return;
  }
  const data = await dataFn(recipient);
  axios({
    method: "POST", // Required, HTTP method, a string, e.g. POST, GET
    url:
      "https://graph.facebook.com/v15.0/" +
      phone_id +
      "/messages?access_token=" +
      token,
    data,
    headers: { "Content-Type": "application/json" },
  });
};
