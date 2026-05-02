const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.mdvfleet.co.tz",
  port: 465,
  secure: true,
  auth: {
    user: "communicaton@mdvfleet.co.tz",
    pass: "Yeshua@2026",
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log("Email Verification Error:", error);
  } else {
    console.log("Server is ready to take our messages");
    
    transporter.sendMail({
      from: '"Dereva Kiganjani Digest" <communicaton@mdvfleet.co.tz>',
      to: "david@mdvfleet.co.tz", 
      subject: "Test Email from Script",
      text: "If you receive this, Nodemailer is working.",
    }).then(info => {
        console.log("Email sent:", info.messageId);
    }).catch(err => {
        console.log("Email Send Error:", err);
    });
  }
});
