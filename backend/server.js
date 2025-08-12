require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const Razorpay = require('razorpay');

const app = express();
const port = 3000;

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:4200'
}));

app.post('/send-sms', (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).send({ success: false, error: 'Missing phone number or message' });
  }
  twilioClient.messages
    .create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: to })
    .then(message => res.send({ success: true, sid: message.sid }))
    .catch(error => res.status(500).send({ success: false, error: error.message }));
});

app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || !receipt) {
      return res.status(400).send({ error: 'Amount and receipt are required.' });
    }
    const order = await razorpayInstance.orders.create({ amount, currency, receipt });
    res.json(order);
  } catch (error) {
    console.error('RAZORPAY ORDER CREATION ERROR:', error);
    res.status(500).json({ message: 'Order creation failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});