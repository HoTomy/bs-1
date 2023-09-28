import {Context, Next} from "koa";
import schema from "../schemas/users";

const signup = async (ctx: Context, next: Next) => {
    const schemaReference = schema.register

    const {error} = schemaReference.validate({...ctx.request.body}, {abortEarly: false})

    if (error) {
        ctx.status = 400
        ctx.body = {
            message: error.details.map((detail) => detail.message)
        }
        return
    }

    await next()
}

const login = async (ctx: Context, next: Next) => {
    const schemaReference = schema.login

    const {error} = schemaReference.validate({...ctx.request.body}, {abortEarly: false})

    if (error) {
        ctx.status = 400
        ctx.body = {
            message: error.details.map((detail) => detail.message)
        }
        return
    }

    await next()
}

export default {signup, login}