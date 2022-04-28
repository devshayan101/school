const express = require('express');

const router = express.Router();

let app = express();
app.use(express.urlencoded({ extended: true }));


router.get('/login', (req, res) => {
    res.render('login')
});

router.get('/logout', (req, res) => {
    //handle with passport
    res.send('logout')
});

//auth with google
router.get('/google', (req, res) => {
    //handle with passport
    res.send('logging in with google')
});

module.exports = router;
