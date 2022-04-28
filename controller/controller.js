const Razorpay = require('razorpay');
const Doc = require('../models/models')
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const mime = require('mime-types');//

// const csrfProtection = csrf({ cookie: true })


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

    const formData = new Doc({
        razorpay_payment_id: req.body.razorpay_payment_id,
        razorpay_order_id: req.body.razorpay_order_id,
        razorpay_signature: req.body.razorpay_signature
    })

    formData.save()
        .then(result => {
            //here result.insertedId gives _id for the inserted document.
            console.log('result_id:' + result._id)
            return res.render('admission-form.ejs', { _id: result._id, title: 'Admission Form', path: '=/submit' })
        })
        .catch(err => console.log('formPostPayment:', err))


    // db.collection('admissions_test').insertOne({
    //     razorpay_payment_id: req.body.razorpay_payment_id,
    //     razorpay_order_id: req.body.razorpay_order_id,
    //     razorpay_signature: req.body.razorpay_signature, active: true
    // }).then(result => {
    //     //here result.insertedId gives _id for the inserted document.
    //     console.log('result_id:' + result.insertedId)
    //     return res.render('admission-form.ejs', { _id: result.insertedId, title: 'Admission Form', path: '=/submit' })

    // })
    //     .catch(err => console.log('formPostPayment:', err))
}


//File-Upload to server
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const maxFileSize = 1 * 1024 * 1024; // 1MB
//Init Upload
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .jpg .jpeg .png formats allowed"))
        }
    }
    // limits: { fileSize: maxFileSize }
}).fields([{ name: 'photo', maxCount: 1 }, { name: 'sign', maxCount: 1 }]);


//put validator here

//put csrf protection
const submitPostPayment = (req, res) => {


    // const errors = validationResult(req);
    // console.log('req.body-validation:', req.body)

    // if (!errors.isEmpty()) {
    //     return res.status(422).json({ errors: errors.array() });
    // }


    const fileName1 = req.files['photo'][0].filename;
    const fileNameString1 = fileName1.toString();
    const filePath1 = req.files['photo'][0].path;
    const filePathString1 = filePath1.toString();


    console.log('req.body:', req.body);

    // payment token fetch
    Doc.findByIdAndUpdate({ _id: req.body._id },
        {
            $set: {
                Class: req.body.class,
                Name: req.body.first_name,
                DOB: req.body.dob,
                Father_Name: req.body.father_name,
                Address: req.body.address,
                Phone: req.body.phone,
                Email: req.body.email,
                Aadhaar: req.body.aadhaar,
                Photo: filePathString1,
                // Signature: filePathString2
                Guardians_Name: req.body.guardian_name,
                Guardian_Phone: req.body.phone_g,

                //Image Upload to database
                img: {
                    data: fs.readFileSync(filePathString1),
                    contentType: mime.lookup(filePathString1)
                }

            }
        }, { new: true }, //new=true give callback with updated document
        (err, result) => {
            if (err) {
                return console.log('error1:', err)
            }
            console.log('req.body._id:', req.body._id)

            console.log('callback:', result)


            // payment signature verification.
            const body = result.razorpay_order_id + "|" + result.razorpay_payment_id;

            var expectedSignature = crypto
                .createHmac("sha256", process.env.key_secret)
                .update(body.toString())
                .digest("hex");
            console.log(("rzp_sig:", result.razorpay_signature));
            console.log('gen_sig:', expectedSignature);

            if (expectedSignature == result.razorpay_signature) {
                console.log('payment is successful')

                //callback is necessary
                Doc.findByIdAndUpdate({ _id: req.body._id }, {
                    $set: {
                        payment: '₹ 50',
                        payment_verification: true
                    }
                }, (err, result) => {
                    if (err) {
                        return console.log('Error in payment data update', err)
                    }
                })

                // Email the form data

                const form_email = `
                <h2>You have a new Student Registration</h2>

                    <h3>Payment: Rs.50 </h3>

                    <h3>Class: ${req.body.class}</h3>
                    <h3>Student Name: ${req.body.student_name}</h3>
                    <h3>Father's Name: ${req.body.father_name}</h3>
                    <h3>Full-Address: ${req.body.address}</h3>
                    <h3>Date of Birth: ${req.body.dob}</h3>
                    <h3>Mobile Number: ${req.body.phone}</h3> 
                    <h3>Email: ${req.body.email}</h3>
                    <h3>Aadhaar: ${req.body.aadhaar}</h3>
                    <h3>Parents Details</h3>
                    <h3>Guardians Name: ${req.body.guardian_name}</h3>
                    <h3>Guardians Phone: ${req.body.phone_g}</h3>
                    `;


                async function main() {

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.sendgrid.net',
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: process.env.USER, // generated ethereal user
                            pass: process.env.PASS // generated ethereal password
                        }

                    });

                    // send mail with defined transport object
                    //This is Admin Mailing.

                    console.log('email:' + req.body.email)
                    //This is customer mailing.
                    let infoCust = await transporter.sendMail({
                        from: 'shayan.devtest@gmail.com', // sender address
                        to: 'shayan.dev98@gmail.com', // list of receivers
                        subject: 'New Student Registration', // Subject line
                        //text: 'Hello world?', // plain text body
                        html: form_email, // html body
                        attachments: [
                            {
                                filename: fileNameString1,
                                path: filePathString1
                            }
                            // {
                            //     filename: fileNameString2,
                            //     path: filePathString2
                            // }
                        ]
                    });

                    return res.render('submit.ejs', { title: 'Form Submited', messege_title: '', messege_body: 'Your admission form has been successfully submited.' })

                }

                main().catch(console.error);
            }
            else {
                console.log('signature mis-match')
                return res.render('submit.ejs', { title: 'Payment Error', messege_title: '', messege_body: 'Payment signature mismatch. Kindly try again or contact support.' })

            }
        })
}


module.exports = {
    orders,
    formPostPayment,
    submitPostPayment,
    upload
}