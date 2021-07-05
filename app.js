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

const allRoutes = require('./routes/allRoutes')

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


app.use(allRoutes);


app.use((req, res) => {
    res.status(404).render('404', { title: 'Error 404' });
})