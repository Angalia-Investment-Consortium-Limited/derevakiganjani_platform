const axios = require("axios");
const https = require("https");

const api_key = "f6474a28e528b27c";
const secret_key = "Y2NlNmMxNjU5MDI2NTI1NmMzMmY5MDcyOGMyMjNjZDU2MjBjNDRiOTRiYjVmMjdmZDE0NTczNDE5NGNmYzFjZA==";
const content_type = "application/json";
const source_addr ="DerevaInfo";

function send_sms() {
  axios
    .post(
      "https://apisms.beem.africa/v1/send",
      {
        source_addr: source_addr,
        schedule_time: "",
        encoding: 0,
        message: "Hello World from Dereva Kiganjani Test",
        recipients: [
          {
            recipient_id: 1,
            dest_addr: "255712345678", // Replace with a safe dummy number or the user's number if I knew it, but testing the auth is what matters. 
          }
        ],
      },
      {
        headers: {
          "Content-Type": content_type,
          Authorization: "Basic " + Buffer.from(api_key + ":" + secret_key).toString('base64'),
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    )
    .then((response) => console.log("SMS API Response:", response.data))
    .catch((error) => console.error("SMS API Error:", error.response ? error.response.data : error.message));
}

send_sms();
