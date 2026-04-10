import express from 'express'
import CookieParser from 'cookie-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true

}))


import userRouter from './routes/user.route.js'
import clientRouter from './routes/client.route.js'
import invoiceRouter from './routes/invoice.route.js'


app.use('/api/v12/users', userRouter)
app.use('/api/v12/clients', clientRouter)
app.use('/api/v12/invoices', invoiceRouter)


export default app