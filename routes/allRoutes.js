const express = require('express');
const controller = require('../controller/controller');
const router = express.Router()




router.get('/', (req, res) => {
    res.render('index.ejs')

});
router.get('/about', (req, res) => {
    res.render('about', { title: 'About us' })
})


router.get('/contact', (req, res) => {
    res.render('contact')
})

router.get('/information', (req, res) => {
    res.render('information.ejs')
})


router.get('/gallery', (req, res) => {
    res.render('gallery', { title: 'Gallery' })
})

router.post('/submit-no-payment-error', (req, res) => {
    res.render('submit-error.ejs', { title: 'Form Error', messege_title: 'Form fees not paid!', messege_body: 'Kindly pay form fee Rs.50 first then fill admission form.' })
})

router.get('/admission-form', (req, res) => {
    res.render('admission-form', { _id: null, title: 'Admission Form', path: '=/submit-no-payment-error' })
})






router.post('/orders', controller.orders)

router.post('/admissions', controller.formPostPayment)


// router.post('/submit', upload, (req, res) => {

//     const fileName1 = req.files['photo'][0].filename;
//     const fileNameString1 = fileName1.toString();
//     const filePath1 = req.files['photo'][0].path;
//     const filePathString1 = filePath1.toString();

//     // const fileName2 = req.files['sign'][0].filename;
//     // const fileNameString2 = fileName2.toString();
//     // const filePath2 = req.files['sign'][0].path;
//     // const filePathString2 = filePath2.toString();




//     // payment token fetch
//     db.collection('admissions_test').findOneAndUpdate({ _id: new mongodb.ObjectId(req.body._id) },
//         {
//             $set: {
//                 Class: req.body.class,
//                 Name: req.body.name,
//                 DOB: req.body.dob,
//                 Father_Name: req.body.father_name,
//                 Address: req.body.address,
//                 Phone: req.body.phone,
//                 Email: req.body.email,
//                 Aadhaar: req.body.aadhaar,
//                 Photo: filePathString1,
//                 // Signature: filePathString2
//             }
//         },
//         (err, result) => {
//             if (err) {
//                 return console.log('error1:', err)
//             }
//             console.log('req.body._id:', req.body._id)

//             console.log('find_id:', result)


//             // payment signature verification.
//             const body = result.value.razorpay_order_id + "|" + result.value.razorpay_payment_id;

//             var expectedSignature = crypto
//                 .createHmac("sha256", process.env.key_secret)
//                 .update(body.toString())
//                 .digest("hex");
//             console.log(("rzp_sig:", result.value.razorpay_signature));
//             console.log('gen_sig:', expectedSignature);

//             if (expectedSignature == result.value.razorpay_signature) {
//                 console.log('payment is successful')

//                 db.collection('admissions_test').findOneAndUpdate({ _id: new mongodb.ObjectId(req.body._id) }, {
//                     $set: {
//                         payment: '₹ 50',
//                         payment_verification: true
//                     }
//                 })

//                 // Email the form data

//                 const form_email = `
//                 <h2>You have a new Student Registration</h2>

//                     <h3>Payment: Rs.50 </h3>

//                     <h3>Class: ${req.body.class}</h3>
//                     <h3>Student Name: ${req.body.name}</h3>
//                     <h3>Father's Name: ${req.body.father_name}</h3>
//                     <h3>Full-Address: ${req.body.address} <br>${req.body.district} <br>${req.body.state} <br>${req.body.pincode} </h3>
//                     <h3>Date of Birth: ${req.body.dob}</h3>
//                     <h3>Mobile Number: ${req.body.phone}</h3> 
//                     <h3>Email: ${req.body.email}</h3>`;


//                 async function main() {
//                     // Generate test SMTP service account from ethereal.email
//                     // Only needed if you don't have a real mail account for testing
//                     //let testAccount = await nodemailer.createTestAccount(); 

//                     // create reusable transporter object using the default SMTP transport
//                     let transporter = nodemailer.createTransport({
//                         host: 'smtp.sendgrid.net',
//                         port: 587,
//                         secure: false, // true for 465, false for other ports
//                         auth: {
//                             user: process.env.USER, // generated ethereal user
//                             pass: process.env.PASS // generated ethereal password
//                         }

//                     });

//                     // send mail with defined transport object
//                     //This is Admin Mailing.

//                     console.log('email:' + req.body.email)
//                     //This is customer mailing.
//                     let infoCust = await transporter.sendMail({
//                         from: 'shayan.devtest@gmail.com', // sender address
//                         to: 'shayan.dev98@gmail.com', // list of receivers
//                         subject: 'New Student Registration', // Subject line
//                         //text: 'Hello world?', // plain text body
//                         html: form_email, // html body
//                         attachments: [
//                             {
//                                 filename: fileNameString1,
//                                 path: filePathString1
//                             }
//                             // {
//                             //     filename: fileNameString2,
//                             //     path: filePathString2
//                             // }
//                         ]
//                     });

//                     return res.render('submit.ejs', { title: 'Form Submited', messege_title: '', messege_title: 'Your admission form has been successfully submited.' })

//                     // return res.render('submit', {
//                     //     class: req.body.class, name: req.body.name,
//                     //     father_name: req.body.father_name, dob: req.body.dob,
//                     //     address: req.body.address + ' ' + req.body.district + ' ' + req.body.state + ' ' + req.body.pincode,
//                     //     phone: req.body.phone
//                     // })
//                 }

//                 main().catch(console.error);
//             }
//             else {
//                 console.log('signature mis-match')
//                 return res.render('submit.ejs', { title: 'Payment Error', messege_title: '', messege_body: 'Payment signature mismatch. Kindly try again or contact support.' })

//             }
//         })
// });

module.exports = router;