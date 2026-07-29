import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { hashPassword } from '../utils/hash.ts';
import { authenticate, checkAdmin } from '../middlewares/auth.middlewares.ts';

type UserRole = 'user' | 'admin';

type UserBody = {
    name: string;
    login: string;
    password: string;
    role: UserRole;
}

async function getUsers(res:FastifyReply) {
    try {
        const search = await db.query(`
            SELECT * FROM users
        `);

        return search.rows
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao buscar usuários.')
    }
}

async function postUser(req:FastifyRequest<{Body: UserBody}>, res:FastifyReply) {
    const { name, login, password, role } = req.body

    const hashedPassword = await hashPassword(password);
    console.log(name, login, password, role)
    try {
        const search = await db.query(`
            SELECT login FROM users WHERE login = $1
        `,[login]);

        if(search.rows.length >= 1) {
            res.code(404).send({ error: `Usuário com login ${login} já cadastrado`})
            return
        };

        const result = await db.query(`
            INSERT INTO users
            (name, login, password, role)
            VALUES
            ($1, $2, $3, $4)
        `,[name, login, hashedPassword, role]);

        if(result.rows.length === 0) {
            res.code(404).send({ error: 'Erro ao cadastrar usuário.' })
        }

        res.code(200).send({ success: 'Sucesso ao cadastrar usuário.' })
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao cadastrar usuário.')
    }
}

export async function usersRoutes(fastify: FastifyInstance) {
    fastify.get('/users', { preHandler: [authenticate, checkAdmin] }, getUsers );
    fastify.post('/user', { preHandler: [authenticate, checkAdmin] }, postUser );
}