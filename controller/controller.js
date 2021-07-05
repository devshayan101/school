const Razorpay = require('razorpay');
const mongodb = require('mongodb');
const dotenv = require('dotenv/config');


let db

const port = process.env.PORT || 8000

mongodb.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
}, function (err, client) {
    if (err) {
        return console.log('Mongodb connection error')
    }


    db = client.db()  //USE IN ATLAS-CLOUD MODE
    console.log('connected to database');

    app.listen(port, () => console.log(`Server started on Port ${port}`));


})


//razorpay init
const instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
})


const orders = (req, res) => {
    var options = {
        amount: 5000,
        currency: "INR",
        payment_capture: '1'
    };

    instance.orders.create(options, function (err, order) {
        if (err) {
            console.log(err);
            return res.json(err.msg);

        }
        console.log(order);
        return res.json(order);
    });
}

const formPostPayment = (req, res) => {

    db.collection('admissions_test').insertOne({
        razorpay_payment_id: req.body.razorpay_payment_id,
        razorpay_order_id: req.body.razorpay_order_id,
        razorpay_signature: req.body.razorpay_signature, active: true
    }).then(result => {
        //here result.insertedId gives _id for the inserted document.
        console.log('result_id:' + result.insertedId)
        return res.render('admission-form.ejs', { _id: result.insertedId, title: 'Admission Form', path: '=/submit' })

    })
        .catch(err => console.log('formPostPayment:', err))
}


module.exports = {
    orders,
    formPostPayment
}