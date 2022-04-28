const { check, validationResult } = require('express-validator');

exports.formCheck = [
    check('email').isEmail(),

    (req, res, next) => {
        const errors = validationResult(req);
        console.log('req.body:', req.body)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        // else next();
        else {
            console.log('req.body:', req.body)
            res.send(`All Well`)
        }
    }
];