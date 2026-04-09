const axios = require("axios");
const https = require("https");

const api_key = "4c1c74a2b68c08fe";
// decoded secret key
const secret_key = Buffer.from("NmI5OTU5ODEyMzRlZjUzOWM1OGNmZDhlNDAyYzRlMTRmYzdjNDk3YzM2YzNjZGNjYjU5ZTFiYmI1YmU5OTk3OA==", "base64").toString("ascii");

console.log("Using API:", api_key);
console.log("Using Secret:", secret_key);

const auth = Buffer.from(api_key + ":" + secret_key).toString('base64');
console.log("Auth Header:", "Basic " + auth);

axios.post(
  "https://apisms.beem.africa/v1/send",
  {
    source_addr: "INFO",
    schedule_time: "",
    encoding: 0,
    message: "Test message from API tool",
    recipients: [
      {
        recipient_id: 1,
        dest_addr: "255627669360",
      },
    ],
  },
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + auth,
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  }
).then(res => {
  console.log("SUCCESS:", res.data);
}).catch(err => {
  console.log("ERROR STATUS:", err.response?.status);
  console.log("ERROR DATA:", err.response?.data);
});
