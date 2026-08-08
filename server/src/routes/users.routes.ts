import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { hashPassword } from '../utils/hash.ts';
import { authenticate, checkAdmin } from '../middlewares/auth.middlewares.ts';

type UserRole = 'user' | 'admin';

type UserPermissionInput = {
    module_id: number;
    access: string;
}

type UserBody = {
    id: number;
    name: string;
    login: string;
    password: string;
    role: UserRole;
    status: boolean;
    permissions?: UserPermissionInput[];
    branchs_id?: number[];
}

async function getUsers(res:FastifyReply) {
    try {
        const usersSearch = await db.query(`
            SELECT id, name, login, role, status FROM users
        `);

        const permissionsSearch = await db.query(`
            SELECT up.user_id, m.id AS module_id, m.slug AS module, up.access
            FROM user_permissions AS up
            JOIN modules AS m ON m.id = up.module_id
        `);

        const branchsSearch = await db.query(`
            SELECT ub.user_id, b.id AS branch_id, b.name AS branch_name
            FROM user_branchs AS ub
            JOIN branchs AS b ON b.id = ub.branchs_id
        `);

        const users = {};

        for (const row of usersSearch.rows) {
            users[row.id] = {
                id: row.id,
                name: row.name,
                login: row.login,
                role: row.role,
                status: row.status,
                permissions: [],
                branchs: []
            }
        }

        for (const row of permissionsSearch.rows) {
            users[row.user_id]?.permissions.push({
                module_id: row.module_id,
                module: row.module,
                access: row.access,
            });
        }

        for (const row of branchsSearch.rows) {
            users[row.user_id]?.branchs.push({
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

async function syncUserRelations(
    userId: number,
    permissions: UserPermissionInput[] | undefined,
    branchsIds: number[] | undefined,
    grantedBy: number
) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        if (permissions !== undefined) {
            await client.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);

            for (const permission of permissions) {
                await client.query(`
                    INSERT INTO user_permissions
                    (user_id, module_id, access, granted_by)
                    VALUES
                    ($1, $2, $3, $4)
                    ON CONFLICT (user_id, module_id) DO NOTHING
                `, [userId, permission.module_id, permission.access, grantedBy]);
            }
        }

        if (branchsIds !== undefined) {
            await client.query('DELETE FROM user_branchs WHERE user_id = $1', [userId]);

            for (const branchId of branchsIds) {
                await client.query(`
                    INSERT INTO user_branchs
                    (user_id, branchs_id)
                    VALUES
                    ($1, $2)
                    ON CONFLICT (user_id, branchs_id) DO NOTHING
                `, [userId, branchId]);
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function postUser(req:FastifyRequest<{Body: UserBody}>, res:FastifyReply) {
    const { name, login, password, role, permissions, branchs_id } = req.body

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
            RETURNING id
        `,[name, login, hashedPassword, role]);

        if(result.rows.length === 0) {
            res.code(404).send({ error: 'Erro ao cadastrar usuário.' })
            return
        }

        await syncUserRelations(result.rows[0].id, permissions, branchs_id, req.user.sub);

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
    const { id, name, login, password, role, status, permissions, branchs_id } = req.body

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
        } else {
            const hashedPassword = await hashPassword(password)

            await db.query(`
                UPDATE users
                SET name = $1, login = $2, password = $3, role = $4, status = $5
                WHERE id = $6
            `,[ name, login, hashedPassword, role, status, id])
        }

        await syncUserRelations(id, permissions, branchs_id, req.user.sub);

        res.code(200).send({ success: `O usuário ${search.rows[0].name} editado com sucesso.` })
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao editar usuário.')
    }
}

type MeBody = {
    name: string;
    login: string;
    password?: string;
}

async function getMe(req:FastifyRequest, res:FastifyReply) {
    try {
        const result = await db.query(`
            SELECT id, name, login, role, status FROM users WHERE id = $1
        `, [req.user.sub]);

        if (result.rows.length === 0) {
            res.code(404).send({ error: 'Usuário não encontrado.' })
            return
        }

        res.code(200).send(result.rows[0])
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao buscar conta.')
    }
}

async function putMe(req:FastifyRequest<{Body: MeBody}>, res:FastifyReply) {
    const userId = req.user.sub
    const name = req.body.name?.trim()
    const login = req.body.login?.trim()
    const { password } = req.body

    try {
        const loginTaken = await db.query(`
            SELECT id FROM users WHERE LOWER(login) = LOWER($1) AND id != $2
        `, [login, userId]);

        if (loginTaken.rows.length > 0) {
            res.code(404).send({ error: `Login ${login} já está em uso.` })
            return
        }

        if (!password) {
            await db.query(`
                UPDATE users
                SET name = $1, login = $2
                WHERE id = $3
            `, [name, login, userId])
        } else {
            const hashedPassword = await hashPassword(password)

            await db.query(`
                UPDATE users
                SET name = $1, login = $2, password = $3
                WHERE id = $4
            `, [name, login, hashedPassword, userId])
        }

        res.code(200).send({ success: 'Conta atualizada com sucesso.' })
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao atualizar conta.')
    }
}

export async function usersRoutes(fastify: FastifyInstance) {
    fastify.get('/users', { preHandler: [authenticate, checkAdmin] }, getUsers );
    fastify.post('/users', { preHandler: [authenticate, checkAdmin] }, postUser );
    fastify.delete('/users', { preHandler: [authenticate, checkAdmin] }, deleteUser );
    fastify.put('/users', { preHandler: [authenticate, checkAdmin] }, putUser );

    fastify.get('/users/me', { preHandler: [authenticate] }, getMe );
    fastify.put('/users/me', { preHandler: [authenticate] }, putMe );
}