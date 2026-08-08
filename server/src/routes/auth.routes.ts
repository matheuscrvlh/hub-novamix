import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { db } from '../database/database.ts'
import { generateToken } from "../utils/jwt.ts";
import { verifyPassword } from "../utils/hash.ts";

type loginBody = {
    user: string
    password: string
}

async function login(req:FastifyRequest<{Body: loginBody}>, res:FastifyReply) {
    const identifier = req.body.user?.trim()
    const { password } = req.body

    try {
        const searchPasswordUser = await db.query(`
            SELECT id, password, role FROM users
            WHERE LOWER(login) = LOWER($1) OR id::text = $1
        `, [identifier])

        if(searchPasswordUser.rows.length === 0) {
            return res.code(401).send({ error: 'Usuario não encontrado.'})
        }

        const comparePassword = await verifyPassword(password, searchPasswordUser.rows[0].password)
        
        if(!comparePassword) {
            return res.code(401).send({ error: 'Senha inválida.'})
        }

        const permissionsResult = await db.query(`
            SELECT m.slug AS module, up.access
            FROM user_permissions up
            JOIN modules m ON m.id = up.module_id
            WHERE up.user_id = $1
        `,[searchPasswordUser.rows[0].id])

        const branchsResult = await db.query(`
            SELECT b.id, b.name
            FROM user_branchs ub
            JOIN branchs b ON b.id = ub.branchs_id
            WHERE ub.user_id = $1
        `,[searchPasswordUser.rows[0].id])

        const token = await generateToken(
            searchPasswordUser.rows[0].id,
            searchPasswordUser.rows[0].role,
            permissionsResult.rows,
            branchsResult.rows
        )

        res.setCookie('token', token, {
            domain: '.lojanovamix.com.br',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24
        })
        
        res.code(201).send({ token })
    } catch(error) {
        console.error(error)
        res.code(500).send({ error: 'Erro ao efetuar login.' })
    }
}

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/auth/login', login)
}