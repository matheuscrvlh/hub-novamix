import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { db } from '../database/database.ts'
import { generateToken, verifyToken } from "../utils/jwt.ts";
import { verifyPassword } from "../utils/hash.ts";

type loginBody = {
    user: string
    password: string
}

async function login(req:FastifyRequest<{Body: loginBody}>, res:FastifyReply) {
    const { user, password } = req.body

    try {
        const searchPasswordUser = db.query(`
            SELECT password FROM users WHERE $1 = login
        `, [user])

        if(searchPasswordUser.rows.length === 0) {
            res.code(401).send({ error: 'Usuario não encontrado.'})
        }

        const comparePassword = await verifyPassword(password, searchPasswordUser)
        
        if(!comparePassword) {
            res.code(401).send({ error: 'Senha inválida.'})
        }

        const token = await generateToken(
            searchPasswordUser.rows[0].id,
            searchPasswordUser.rows[0].role
        )

        return token
    } catch(error) {
        console.error(error)
        throw new Error('Erro ao efetuar login.')
    }
}

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/auth/login', login)
}