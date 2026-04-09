const axios = require("axios");
const https = require("https");

const api_key = "fe1fcc2c58d7d1bb";
const secret_key = "NTc4OWRmMTkyNDEwMjQwMTMxNWIzNjcxY2UzNDc3OTFmNzdkYmRkMDE5NTcwMWE2Yzg5MmI4MzRiM2NmMWZkYg==";
const authHeader = "Basic " + Buffer.from(api_key + ":" + secret_key).toString("base64");

axios.get("https://apisms.beem.africa/public/v1/vendors/balance", {
  headers: {
    "Content-Type": "application/json",
    Authorization: authHeader,
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
}).then(res => {
  console.log("SUCCESS:", res.data);
}).catch(err => {
  console.log("ERROR STATUS:", err.response?.status);
  console.log("ERROR DATA:", err.response?.data);
});
