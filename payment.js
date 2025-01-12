const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'paymentDB';
let db;

MongoClient.connect(mongoUrl, (err, client) => {
    if (err) throw err;
    db = client.db(dbName);
    console.log(`MongoDB connected to ${dbName}`);
});

const app = express();
app.use(bodyParser.json());

const port = 3000;

app.get('/', (req, res) => res.send("Hello World!"));

let rzp = new Razorpay({
    key_id: "", // Example Key ID; replace with your actual Razorpay Key ID
    key_secret: "" // Example Key Secret; replace with your actual Razorpay Key Secret
});

app.post('/create-order', (req, res) => {
    const options = {
        amount: req.body.amount * 100, // amount in the smallest currency unit (paisa)
        currency: "INR",
        receipt: "order_rcptid_11"
    };

    rzp.orders.create(options, (err, order) => {
        if (err) {
            return res.status(500).json({
                message: "Something went wrong",
                error: err
            });
        }
        res.json(order);
    });
});

app.post('/payment-success', (req, res) => {
    const paymentDetails = {
        order_id: req.body.order_id,
        payment_id: req.body.payment_id
    };

    db.collection('payments').insertOne(paymentDetails, (err, result) => {
        if (err) {
            return res.status(500).send("Failed to record payment");
        }
        res.send("Payment Successful")
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
