import Koa, { Context, Next } from 'koa'
import { koaBody } from 'koa-body'
import session from "koa-session"
import json from "koa-json"
import Router from "koa-router"
import logger from 'koa-logger'
import cors from 'koa2-cors'
import serve from 'koa-static';
import database from "./utils/database";
import * as dotenv from 'dotenv'
import usersRouter from './routes/users'
import authRouter from './routes/auth'
import booksRouter from './routes/books'
import ordersRouter from './routes/orders'
import { runSeeders } from "typeorm-extension";

(async () => {
  dotenv.config()
  await database.AutoCreateDatabase().then(() => {
    console.log('Initial database successfully!')
  })

  await database.AppDataSource.initialize().then(async () => {
    console.log("Connect database successfully!")
    const app = new Koa()
    const port = process.env.PORT || 3000

    app.keys = ['my-session-secret']
    app.use(session(app))
    app.use(serve('./src/docs'))

    app.use(logger())
    app.use(json())
    app.use(cors({ origin: 'http://localhost:3001' }))
    app.use(koaBody({
      multipart: true,
      formidable: {
        maxFileSize: 200 * 1024 * 1024,
        uploadDir: __dirname + '/public/uploads'
      }
    }))

    const mainRouter = new Router({ prefix: "/api" })
    mainRouter.use(usersRouter.routes(), usersRouter.allowedMethods())
    mainRouter.use(authRouter.routes(), authRouter.allowedMethods())
    mainRouter.use(petsRouter.routes(), petsRouter.allowedMethods())
    mainRouter.use(likesRouter.routes(), likesRouter.allowedMethods())

    app.use(mainRouter.routes())

    app.use(async (ctx: Context, next: Next) => {
      try {
        await next()
        if (ctx.status === 404) {
          ctx.status = 404
          ctx.body = { err: "No such endpoint existed" }
        }
      } catch (err: any) {
        ctx.body = { err: err }
      }
    })

    app.listen(port).on("listening", () => console.log(`Server started on port: ${port}!`))
  }).catch((error) => console.log(error))

  await runSeeders(database.AppDataSource, {
    seeds: ['src/utils/db/seeders/**/*{.ts,.js}']
  })
})()