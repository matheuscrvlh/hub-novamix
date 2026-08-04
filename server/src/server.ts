import Fastify from "fastify"
import 'dotenv/config'
import cors from "@fastify/cors";
import cookie from '@fastify/cookie';
import { db } from './database/database.ts'
import { authRoutes } from "./routes/auth.routes.ts";
import { usersRoutes } from "./routes/users.routes.ts";
import { branchsRoutes } from "./routes/branchs.routes.ts";

const app = Fastify();

await app.register(cors, {
    origin: '*'
})

if(!process.env.DATABASE_URL) {
    throw new Error('Erro ao encontrar DATABASE_URL no .env.');
} else if(!process.env.SERVER_PORT) {
    throw new Error('Erro ao encontrar SERVER_PORT no .env.');
}

app.register(cookie)
app.register(authRoutes)
app.register(usersRoutes)
app.register(branchsRoutes)

async function start() {
    await app.listen({ host: '0.0.0.0', port: process.env.SERVER_PORT });
    console.log(`Servidor rodando na porta ${process.env.SERVER_PORT}`)

    await db.query(`SELECT NOW()`)
    console.log('Supabase conectado')
}

start()