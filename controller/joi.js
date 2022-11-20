const joi = require('joi');

const formSchema = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    class: joi.string().required(),
    address: joi.string().required(),
    dob: joi.string().required(),
    phone: joi.string().required(),
    aadhaar: joi.string().required(),
    email: joi.string().required().email(),
})