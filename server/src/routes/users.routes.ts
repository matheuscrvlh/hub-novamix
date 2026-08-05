import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { hashPassword } from '../utils/hash.ts';
import { authenticate, checkAdmin } from '../middlewares/auth.middlewares.ts';

type UserRole = 'user' | 'admin';

type UserBody = {
    id: number;
    name: string;
    login: string;
    password: string;
    role: UserRole;
    status: boolean
}

async function getUsers(res:FastifyReply) {
    try {
        const search = await db.query(`
            SELECT 
                u.id, 
                u.name, 
                u.login, 
                u.role, 
                u.status,
                up.access,
                m.slug AS module,
                b.id AS branch_id,
                b.name AS branch_name
            FROM users AS u
            LEFT JOIN user_permissions AS up
                ON u.id = up.user_id
            LEFT JOIN modules AS m
                ON up.module_id = m.id
            LEFT JOIN user_branchs AS ub
                ON u.id = ub.user_id
            LEFT JOIN branchs AS b
                ON ub.branchs_id = b.id
        `);

        const users = {};

        for (const row of search.rows) {
            if(!users[row.id]) {
                users[row.id] = {
                    id: row.id,
                    name: row.name,
                    login: row.login,
                    role: row.role,
                    status: row.status,
                    permissions: [],
                    branchs: []
                }
            };

            users[row.id].permissions.push({
                module: row.module,
                access: row.access,
            });

            users[row.id].branchs.push({
                id: row.branch_id,
                name: row.branch_name
            })
        }

        const result = Object.values(users);
        return result

    } catch(error) {
        console.error(error);
        throw new Error('Erro ao buscar usuários.')
    }
}

async function postUser(req:FastifyRequest<{Body: UserBody}>, res:FastifyReply) {
    const { name, login, password, role } = req.body

    const hashedPassword = await hashPassword(password);
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

async function deleteUser(req:FastifyRequest<{Body: UserBody}>, res:FastifyReply) {
    const { id } = req.body

    try {
        const search = await db.query(`
            SELECT name
            FROM users 
            WHERE id = $1
        `,[id]);

        if(search.rows.length === 0) {
            res.code(404).send({ error: 'Usuário não encontrado.' })
            return
        };

        await db.query(`
            DELETE FROM users
            WHERE id = $1
        `,[id]);

        res.code(200).send({ success: `O usuário ${search.rows[0].name} deletado com sucesso.` })
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao deletar usuário.')
    }
}

async function putUser(req:FastifyRequest<{Body: UserBody}>, res:FastifyReply) {
    const { id, name, login, password, role, status } = req.body

    try {
        const search = await db.query(`
            SELECT name 
            FROM users 
            WHERE id = $1
        `,[id]);

        if(search.rows.length === 0) {
            res.code(404).send({ error: 'Usuário não encontrado.' })
            return
        }

        if(!password) {
            await db.query(`
                UPDATE users
                SET name = $1, login = $2, role = $3, status = $4
                WHERE id = $5
            `,[ name, login, role, status, id])

            res.code(200).send({ success: `O usuário ${search.rows[0].name} editado com sucesso.` })
            return
        }

        const hashedPassword = await hashPassword(password)

        await db.query(`
            UPDATE users
            SET name = $1, login = $2, password = $3, role = $4, status = $5
            WHERE id = $6
        `,[ name, login, hashedPassword, role, status, id])

        res.code(200).send({ success: `O usuário ${search.rows[0].name} editado com sucesso.` })
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao editar usuário.')
    }
}

export async function usersRoutes(fastify: FastifyInstance) {
    fastify.get('/users', { preHandler: [authenticate, checkAdmin] }, getUsers );
    fastify.post('/user', { preHandler: [authenticate, checkAdmin] }, postUser );
    fastify.delete('/user', { preHandler: [authenticate, checkAdmin] }, deleteUser );
    fastify.put('/user', { preHandler: [authenticate, checkAdmin] }, putUser );
}