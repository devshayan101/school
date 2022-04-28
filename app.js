const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const dotenv = require('dotenv/config');
const mongoose = require('mongoose')

const authRoute = require('./routes/authRoutes')
const allRoutes = require('./routes/allRoutes')


let app = express();

const port = process.env.PORT || 8000

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => app.listen(port, () => console.log(`Server started on port ${port}`)))
    .catch(err => console.log(`db connection`, err))


// app.engine('handlebars', exphbs());     //for handlebars
// app.set('view engine', 'handlebars');    //for handlebars

app.set('view engine', 'ejs');     //for ejs  
app.use(expressLayouts);          //for ejs



// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Public Folder
app.use(express.static('./public'));



//ROUTES

app.use('/auth', authRoute);
app.use(allRoutes);


//CSRF ERROR HANDLING

// app.use(function (err, req, res, next) {
//     if (err.code !== 'EBADCSRFTOKEN') return next(err)

//     // handle CSRF token errors here
//     res.status(403)
//     res.send('form tampered with')
// })


app.use((req, res) => {
    res.status(404).render('404', { title: 'Error 404' });
})