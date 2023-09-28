import {Context, Next} from "koa";
import schema from "../schemas/books";

const create = async (ctx: Context, next: Next) => {
    const schemaReference = schema.add

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

const update = async (ctx: Context, next: Next) => {
    const schemaReference = schema.update

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

export default {create, update}