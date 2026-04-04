const axios = require("axios");
const https = require("https");
const btoa = require("btoa");

const api_key = "4c1c74a2b68c08fe";
const secret_key = "NmI5OTU5ODEyMzRlZjUzOWM1OGNmZDhlNDAyYzRlMTRmYzdjNDk3YzM2YzNjZGNjYjU5ZTFiYmI1YmU5OTk3OA==";
const content_type = "application/json";

function send_sms() {
  axios
    .post(
      "https://apisms.beem.africa/v1/send",
      {
        source_addr: "INFO",
        schedule_time: "",
        encoding: 0,
        message: "Hello world",
        recipients: [
          {
            recipient_id: 1,
            dest_addr: "255627669360",
          }
        ],
      },
      {
        headers: {
          "Content-Type": content_type,
          Authorization: "Basic " + btoa(api_key + ":" + secret_key),
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    )
    .then((response) => console.log("SUCCESS:", response.data))
    .catch((error) => console.error("ERROR:", error.response?.data || error.message));
}

send_sms();
