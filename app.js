const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const csrf = require('csurf')
const multer = require('multer');
const dotenv = require('dotenv/config');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const { check, validationResult } = require('express-validator');
const path = require('path');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');

//razorpay init
const instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
})

let app = express();
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

// app.engine('handlebars', exphbs());     //for handlebars
// app.set('view engine', 'handlebars');    //for handlebars

app.set('view engine', 'ejs');     //for ejs  
app.use(expressLayouts);          //for ejs


app.use(express.json());
const csrfProtection = csrf({ cookie: true })
// Express body parser
app.use(express.urlencoded({ extended: true }));
const urlencodedParser = bodyParser.urlencoded({ extended: false });
//Public Folder
app.use(express.static('./public'));


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




//ROUTES

// app.get('/', (req, res) => {
//     res.render('front.ejs');

// });

app.get('/', (req, res) => {
    res.render('index.ejs');

});
app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/blog-home', (req, res) => {
    res.render('blog-home')
})

app.get('/blog-single', (req, res) => {
    res.render('blog-single')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

app.get('/information', (req, res) => {
    res.render('information.ejs')
})

app.get('/courses', (req, res) => {
    res.render('courses')
})

app.get('/events', (req, res) => {
    res.render('events')
})

app.get('/gallery', (req, res) => {
    res.render('gallery')
})

app.post('/submit-error', (req, res) => {
    res.render('submit-error.ejs')
})

app.get('/admission-form', (req, res) => {
    res.render('admission-form', { _id: null })
})






app.post('/orders', (req, res) => {
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
})

app.post('/admissions', (req, res) => {
    console.log(req.body)

    db.collection('admissions_test').insertOne({
        razorpay_payment_id: req.body.razorpay_payment_id,
        razorpay_order_id: req.body.razorpay_order_id,
        razorpay_signature: req.body.razorpay_signature, active: true
    }).then(result => {
        //here result.insertedId gives _id for the inserted document.
        console.log('result_id:' + result.insertedId)
        return res.render('admission-form-post.ejs', { _id: result.insertedId })

    })
})


app.post('/submit', upload, (req, res) => {

    const fileName1 = req.files['photo'][0].filename;
    const fileNameString1 = fileName1.toString();
    const filePath1 = req.files['photo'][0].path;
    const filePathString1 = filePath1.toString();

    // const fileName2 = req.files['sign'][0].filename;
    // const fileNameString2 = fileName2.toString();
    // const filePath2 = req.files['sign'][0].path;
    // const filePathString2 = filePath2.toString();


    //Form data updation on payment signature verification.
    // db.collection('admissions_test').findOneAndUpdate({ _id: req.body._id },
    //     {
    //         $set: {
    //             Class: req.body.class,
    //             Name: req.body.name,
    //             DOB: req.body.dob,
    //             Father_Name: req.body.father_name,
    //             Address: req.body.address,
    //             district: req.body.district,
    //             State: req.body.state,
    //             Phone: req.body.phone,
    //             Email: req.body.email,
    //             Aadhaar: req.body.aadhaar,
    //             Photo: filePathString1,
    //             Signature: filePathString2
    //         }
    //     }
    // ).then(result => {
    //     console.log(result);
    // }).catch(err => {
    //     console.log(err)
    // })


    // payment token fetch
    db.collection('admissions_test').findOneAndUpdate({ _id: new mongodb.ObjectId(req.body._id) },
        {
            $set: {
                Class: req.body.class,
                Name: req.body.name,
                DOB: req.body.dob,
                Father_Name: req.body.father_name,
                Address: req.body.address,
                district: req.body.district,
                State: req.body.state,
                Phone: req.body.phone,
                Email: req.body.email,
                Aadhaar: req.body.aadhaar,
                Photo: filePathString1,
                // Signature: filePathString2
            }
        },
        (err, result) => {
            if (err) {
                return console.log('error1:', err)
            }
            console.log('req.body._id:', req.body._id)

            console.log('find_id:', result)


            // payment signature verification.
            const body = result.value.razorpay_order_id + "|" + result.value.razorpay_payment_id;

            var expectedSignature = crypto
                .createHmac("sha256", process.env.key_secret)
                .update(body.toString())
                .digest("hex");
            console.log(("rzp_sig:", result.value.razorpay_signature));
            console.log('gen_sig:', expectedSignature);

            if (expectedSignature == result.value.razorpay_signature) {
                console.log('payment is successful')

                db.collection('admissions_test').findOneAndUpdate({ _id: new mongodb.ObjectId(req.body._id) }, {
                    $set: {
                        payment: '₹ 50',
                        payment_verification: true
                    }
                })

                // Email the form data

                const form_email = `
                <h2>You have a new Student Registration</h2>

                    <h3>Payment: Rs.50 </h3>

                    <h3>Class: ${req.body.class}</h3>
                    <h3>Student Name: ${req.body.name}</h3>
                    <h3>Father's Name: ${req.body.father_name}</h3>
                    <h3>Full-Address: ${req.body.address} <br>${req.body.district} <br>${req.body.state} <br>${req.body.pincode} </h3>
                    <h3>Date of Birth: ${req.body.dob}</h3>
                    <h3>Mobile Number: ${req.body.phone}</h3> 
                    <h3>Email: ${req.body.email}</h3>`;


                async function main() {
                    // Generate test SMTP service account from ethereal.email
                    // Only needed if you don't have a real mail account for testing
                    //let testAccount = await nodemailer.createTestAccount(); 

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

                    return res.render('submit.ejs')

                    // return res.render('submit', {
                    //     class: req.body.class, name: req.body.name,
                    //     father_name: req.body.father_name, dob: req.body.dob,
                    //     address: req.body.address + ' ' + req.body.district + ' ' + req.body.state + ' ' + req.body.pincode,
                    //     phone: req.body.phone
                    // })
                }

                main().catch(console.error);
            }
            else {
                console.log('signature mis-match')
                return res.sendFile(__dirname + '/public/submit_paymentError.html')

            }

        })










});