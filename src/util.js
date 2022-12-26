const axios = require("axios");
const { htmlToText } = require("html-to-text");

exports.genLecturas = function (_date = null) {
  const date =
    _date || new Date().toISOString().split("T")[0].replace(/-/g, "");
  return axios
    .get(
      `https://feed.evangelizo.org/v2/reader.php?date=${date}&type=all&lang=SP`
    )
    .then((content) => {
      const replace = "*~";
      const converted = htmlToText(content.data, {
        selectors: [
          {
            selector: "br",
            format: "inlineString",
            options: { string: replace },
          },
        ],
        wordwrap: false,
      });
      let readings = converted.split(replace + replace + replace);
      const [title, firstReading] = readings[0].split(replace + replace);
      readings[0] = firstReading;
      readings = readings.slice(0, readings.length - 1).map((reading) => {
        const [title, ...readingBody] = reading.split(replace);
        return `${enbold(title)}\n${readingBody
          .map((r) => r.trim())
          .join("\n")}`;
      });
      return enbold(title) + "\n\n" + readings.join("\n\n\n");
    });
};

function enbold(string) {
  return "*" + string.trim() + "*";
}

exports.isWhatsAppRequest = function (req) {
  return req?.body?.object === "whatsapp_business_account";
};

exports.isWhatsAppMessage = function (req) {
  return (
    req.body.entry &&
    req.body.entry[0].changes &&
    req.body.entry[0].changes[0] &&
    req.body.entry[0].changes[0].value.messages &&
    req.body.entry[0].changes[0].value.messages[0]
  );
};
