import {Context, Next} from "koa";
import authUtil from '../utils/auth'
import * as dotenv from 'dotenv'
import google from "../utils/google";
import usersService from "../services/users";
import usersRepository from "../services/users";
import {Users} from "../entities/users";
import {TokenPayload} from "google-auth-library";

dotenv.config()

const authJwt = async (ctx: Context, next: Next) => {
    const authorizationHeader = ctx.header['authorization']
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        const token = authorizationHeader.substring(7)
        try {
            ctx.state.user = await authUtil.verifyToken(token)
            await next()
        } catch (err) {
            ctx.status = 401
            ctx.body = {
                err: 'Token Expired'
            }
            return
        }
    } else {
        ctx.status = 401
        ctx.body = {
            err: 'Invalid token'
        }
        return
    }
}

const authRefreshJwt = async (ctx: Context, next: Next) => {
    const refresh = ctx.request.body.refresh

    try {
        ctx.state.user = await authUtil.verifyRefreshToken(refresh)
        await next()
    } catch (err) {
        ctx.status = 401
        ctx.body = {
            err: 'Invalid refresh token'
        }
        return
    }
}

const refreshJwt = async (ctx: Context, next: Next) => {
    const user = ctx.state.user
    if (user != null)
        await authUtil.genJwt(user)
            .then((data) => {
                ctx.status = 200
                ctx.body = {
                    token: data.token,
                    refresh: data.refresh,
                    user: {
                        id: user.data.id,
                        nickname: user.data.nickname,
                        staff_code: user.data.staff_code,
                        provider: user.data.provider
                    }
                }
            })
    await next()
}

const authGoogle = async (ctx: Context) => {
    const code = ctx.request.query.code as string
    const payload: TokenPayload | undefined = await google.getUserDetails(code)
    if (payload) {
        const user = await usersService.checkUserExist({email: payload.email, provider: 'google'})
        if (user) {
            await authUtil.genJwt(user)
                .then((data) => {
                    ctx.status = 200
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
        } else {
            const check = !!(await usersService.checkUserExist({email: payload.email}))
            if (check) {
                ctx.status = 409
                ctx.body = {
                    err: "User exist but not connect google oauth!"
                }
                return
            }

            const newGoogleUser = new Users()
            newGoogleUser.email = payload.email!
            newGoogleUser.username = payload.email!.split('@', 1)[0]
            newGoogleUser.provider = 'google'
            newGoogleUser.nickname = payload.name!
            await authUtil.hashPassword('123456')
                .then((data) => {
                    newGoogleUser.password = data.hashedPassword
                    newGoogleUser.password_salt = data.salt
                }).catch((err) => {
                    ctx.status = 400
                    ctx.body = {err: err}
                    return
                })
            await usersRepository.create(newGoogleUser).then(res => {
                authUtil.genJwt(res)
                    .then((data) => {
                        ctx.status = 200
                        ctx.body = {
                            token: data.token,
                            refresh: data.refresh,
                            user: {
                                id: res.id,
                                nickname: res.nickname,
                                staff_code: res.staff_code,
                                provider: res.provider
                            }
                        }
                    })
            })
        }
    }
}

export default {authJwt, authRefreshJwt, refreshJwt, authGoogle}