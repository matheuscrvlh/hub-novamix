import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { authenticate, checkAdmin } from '../middlewares/auth.middlewares.ts';

export async function getSystems() {
    try {
        const result = await db.query(`
            SELECT * FROM systems
        `)

        return result.rows
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar sistemas.')
    }
}

export async function postSystem(req:FastifyRequest, res:FastifyReply) {
    const { name, link } = req.body

    try {
        await db.query(`
            INSERT INTO systems
            (name, link)
            VALUES
            ($1, $2)
        `, [name, link])

        res.code(200).send({ success: `Sistema ${name} cadastrado com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao cadastrar sistema.')
    }
}

export async function putSystem(req:FastifyRequest, res:FastifyReply) {
    const { id, name, link, status } = req.body

    try {
        await db.query(`
            UPDATE systems
            SET name = $1, link = $2, status = $3
            WHERE id = $4
        `, [name, link, status, id])

        res.code(200).send({ success: `Sistema ${name} editado com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao editar sistema.')
    }
}

export async function deleteSystem(req:FastifyRequest, res:FastifyReply) {
    const { id, name } = req.body

    try {
        await db.query(`
            DELETE FROM systems
            WHERE id = $1
        `, [id])

        res.code(200).send({ success: `Sistema ${name} excluído com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir sistema.')
    }
}

export async function systemsRoutes(fastify:FastifyInstance) {
    fastify.get('/systems', { preHandler: [ authenticate ] }, getSystems);
    fastify.post('/systems', { preHandler: [ authenticate, checkAdmin ] }, postSystem);
    fastify.put('/systems', { preHandler: [ authenticate, checkAdmin ] }, putSystem);
    fastify.delete('/systems', { preHandler: [ authenticate, checkAdmin ] }, deleteSystem);
}
