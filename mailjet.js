/**
 *
 * Run:
 *
 */
require('dotenv/config');
 const mailjet = require('node-mailjet').connect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  )
  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'makkiajamia@gmail.com',
          Name: 'Me',
        },
        To: [
          {
            Email: 'shayan.dev98@gmail.com',
            Name: 'You',
          },
        ],
        Subject: 'My first Mailjet Email!',
        TextPart: 'Greetings from Mailjet!',
        HTMLPart:
          '<h3>Dear passenger 1, welcome to <a href="https://www.mailjet.com/">Mailjet</a>!</h3><br />May the delivery force be with you!',
      },
    ],
  })
  request
    .then(result => {
      console.log(result.body)
    })
    .catch(err => {
      console.log(err.statusCode)
    })