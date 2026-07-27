import Fastify from "fastify"
import 'dotenv/config'
import cors from "@fastify/cors";
import { db } from './database/database.ts'
import { authRoutes } from "./routes/auth.routes";

const app = Fastify();

await app.register(cors, {
    origin: '*'
})

if(!process.env.DATABASE_URL) {
    throw new Error('Erro ao encontrar DATABASE_URL no .env.');
}

app.register(authRoutes)

async function start() {
    await app.listen({ port: 3009 });
    console.log('Servidor rodando na porta 3009')

    await db.query(`SELECT NOW()`)
    console.log('Supabase conectado')
}

start()