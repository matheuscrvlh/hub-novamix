import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { authenticate, checkAdmin } from '../middlewares/auth.middlewares.ts';

export async function getModules() {
    try {
        const result = await db.query(`
            SELECT * FROM modules
        `)

        return result.rows
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar módulos.')
    }
}

export async function postModule(req:FastifyRequest, res:FastifyReply) {
    const { name, slug, public_link, private_link, image } = req.body

    try {
        await db.query(`
            INSERT INTO modules
            (name, slug, public_link, private_link, image)
            VALUES
            ($1, $2, $3, $4, $5)
        `, [name, slug, public_link, private_link, image])

        res.code(200).send({ success: `Módulo ${name} cadastrado com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao cadastrar módulo.')
    }
}

export async function putModule(req:FastifyRequest, res:FastifyReply) {
    const { id, name, slug, public_link, private_link, image, status } = req.body

    try {
        await db.query(`
            UPDATE modules
            SET name = $1, slug = $2, public_link = $3, private_link = $4, image = $5, status = $6
            
            WHERE id = $7
        `, [name, slug, public_link, private_link, image, status, id])

        res.code(200).send({ success: `Módulo ${name} editado com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao editar módulo.')
    }
}

export async function deleteModule(req:FastifyRequest, res:FastifyReply) {
    const { id, name } = req.body

    try {
        await db.query(`
            DELETE FROM modules
            WHERE id = $1
        `, [id])

        res.code(200).send({ success: `Módulo ${name} excluído com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir módulo.')
    }
}

export async function modulesRoutes(fastify:FastifyInstance) {
    fastify.get('/modules', { preHandler: [ authenticate ] }, getModules);
    fastify.post('/modules', { preHandler: [ authenticate, checkAdmin ] }, postModule);
    fastify.put('/modules', { preHandler: [ authenticate, checkAdmin ] }, putModule);
    fastify.delete('/modules', { preHandler: [ authenticate, checkAdmin ] }, deleteModule);
}