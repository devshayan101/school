const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const docSchema = new Schema({

    razorpay_payment_id: { type: String },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String },


    Class: { type: String },
    Name: { type: String },
    DOB: { type: Date },
    Father_Name: { type: String },
    Address: { type: String },
    district: { type: String },
    State: { type: String },
    Phone: { type: Number },
    Email: { type: String },
    Aadhaar: { type: Number },
    Guardians_Name: { type: String },
    Guardians_Phone: { type: Number },
    Photo: { type: String },

    img: {
        data: Buffer,
        contentType: String
    },


    payment: { type: String },
    payment_verification: { type: Boolean }

}, { timestamps: true })

const Doc = mongoose.model('form', docSchema)
// Here 'D' is caps in Doc is it will be used as a constructor function.
module.exports = Doc;