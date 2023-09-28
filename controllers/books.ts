import {Context} from "koa";
import booksRepository from '../services/books'
import {Books} from "../entities/books";
import {Users} from "../entities/users";

const getAll = async (ctx: Context, next: any) => {
    ctx.status = 200
    ctx.body = await petsRepository.getAll()
    await next()
}
const getById = async (ctx: Context, next: any) => {
    ctx.status = 200
    ctx.body = await petsRepository.getById(+ctx.params.id)
    await next()
}

const add = async (ctx: Context, next: any) => {
    ctx.status = 200
    const requestBody = <Pets>ctx.request.body
    const currentUser = <Users>ctx.state.user.data
    if (!currentUser.staff_code) {
        ctx.body = {message: 'User is not a staff!'}
        return
    }
    requestBody.created_by = currentUser
    ctx.body = await petsRepository.create(<Pets>ctx.request.body)
    await next()
}

const update = async (ctx: Context, next: any) => {
    ctx.status = 200
    const requestBody = <Pets>ctx.request.body
    const currentUser = <Users>ctx.state.user.data
    if (!currentUser.staff_code) {
        ctx.body = {message: 'User is not a staff!'}
        return
    }
    requestBody.updated_by = currentUser
    const result = await petsRepository.update(+ctx.params.id, <Pets>ctx.request.body)
    ctx.body = result ? result : {message: "Invalid request!"}
    await next()
}

const remove = async (ctx: Context, next: any) => {
    ctx.status = 200
    const currentUser = <Users>ctx.state.user.data
    if (!currentUser.staff_code) {
        ctx.body = {message: 'User is not a staff!'}
        return
    }
    ctx.body = await petsRepository.remove(+ctx.params.id, currentUser) ? {message: "Item deleted successfully"} : {message: "Item not found!"}
    await next()
}

export default {getAll, getById, add, update, remove}