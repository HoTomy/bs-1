import Joi from "joi";

const register = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    avatar: Joi.string().allow(null, ''),
    nickname: Joi.string().allow(null, ''),
    gender: Joi.boolean(),
    staff_code: Joi.string().allow(null, '')
})

const login = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

export default {register, login}
