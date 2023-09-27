import { Context } from "koa";
import { Users } from "../entities/users";
import usersRepository from '../services/users'
import authUtil from '../utils/auth'

const signup = async (ctx: Context) => {
  ctx.status = 200
  const request = <Users>ctx.request.body
  if (request.staff_code) {
    const checkStaff = !!(await usersRepository.checkStaffCodeExist(request.staff_code))
    if (!checkStaff)
      request.staff_code = ""
  }
  const check = !!(await usersRepository.checkUserExist({
    username: request.username,
    email: request.email
  }))
  if (check) {
    ctx.status = 409
    ctx.body = {
      err: "User already exist!"
    }
    return
  }

  await authUtil.hashPassword(request.password)
    .then((data) => {
      request.password = data.hashedPassword
      request.password_salt = data.salt
    }).catch((err) => {
      ctx.status = 400
      ctx.body = { err: err }
      return
    })
  ctx.body = await usersRepository.create(request)
}
const login = async (ctx: Context) => {
  ctx.status = 200
  const { username, password } = <Users>ctx.request.body
  const user = await usersRepository.getByUsername(username)
  if (user == null || !await authUtil.checkPassword(password, user.password)) {
    ctx.status = 401
    ctx.body = { err: 'Invalid username or password' }
    return
  }

  await authUtil.genJwt(user)
    .then((data) => {
      ctx.body = {
        token: data.token,
        refresh: data.refresh,
        user: {
          id: user.id,
          nickname: user.nickname,
          staff_code: user.staff_code,
          provider: user.provider
        }
      }
    })
}

export default { signup, login }