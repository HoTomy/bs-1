import {Context, Next} from "koa"
import Joi from 'joi'
import validateUser from "../validators/users"
import validateAuth from "../validators/auth"
import validateBook from "../validators/books"


const validateId = async (ctx: Context, next: Next) => {
    const schema = Joi.number().integer().positive().required()

    const {error} = schema.validate(ctx.params.id)
    if (error) {
        ctx.status = 400
        ctx.body = {
            message: error.details[0].message
        }
        return
    }
    await next()
}

export default {validateId, validateUser, validateAuth, validatePet}