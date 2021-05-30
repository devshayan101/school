const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const csrf = require('csurf')
const multer = require('multer');
const dotenv = require('dotenv/config');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const { check, validationResult } = require('express-validator');
const path = require('path');
const nodemailer = require('nodemailer');


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

//app.set('view engine','ejs)       //for ejs
//app.use(expressLayouts);          //for ejs


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
const maxFileSize = 1 * 1024 * 1024; //for 1MB
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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/form.html')
});
app.post('/submit', upload, (req, res) => {

    const form_email = `
               <h2>You have a new Student Registration</h2>
    <h3>Class: ${req.body.class}</h3>
    <h3>Student Name: ${req.body.name}</h3>
    <h3>Father's Name: ${req.body.father_name}</h3>
    <h3>Full-Address: ${req.body.address} <br>${req.body.district} <br>${req.body.state} <br>${req.body.pincode} </h3>
    <h3>Date of Birth: ${req.body.dob}</h3>
    <h3>Mobile Number: ${req.body.phone}</h3> 
    <h3>Email: ${req.body.email}</h3>`;

    const fileName1 = req.files['photo'][0].filename;
    const fileNameString1 = fileName1.toString();
    const filePath1 = req.files['photo'][0].path;
    const filePathString1 = filePath1.toString();

    const fileName2 = req.files['sign'][0].filename;
    const fileNameString2 = fileName2.toString();
    const filePath2 = req.files['sign'][0].path;
    const filePathString2 = filePath2.toString();

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
            to: req.body.email, // list of receivers
            subject: 'New Student Registration', // Subject line
            //text: 'Hello world?', // plain text body
            html: form_email, // html body
            attachments: [
                {
                    filename: fileNameString1,
                    path: filePathString1
                },
                {
                    filename: fileNameString2,
                    path: filePathString2
                }
            ]
        });

        return res.sendFile(__dirname + '/public/submit.html')

        // return res.render('submit', {
        //     class: req.body.class, name: req.body.name,
        //     father_name: req.body.father_name, dob: req.body.dob,
        //     address: req.body.address + ' ' + req.body.district + ' ' + req.body.state + ' ' + req.body.pincode,
        //     phone: req.body.phone
        // })
    }

    main().catch(console.error);
});