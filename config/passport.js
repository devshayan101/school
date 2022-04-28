const passport = require('passport');
const GoogleStratergy = require('passport-google-oauth20');

passport.use(new GoogleStratergy({
    //options for google stratergy
}), () => {
    //passport callback function
})