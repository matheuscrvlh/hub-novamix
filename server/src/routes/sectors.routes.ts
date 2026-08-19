import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { authenticate, checkAdmin } from '../middlewares/auth.middlewares.ts';

export async function getSectors() {
    try {
        const result = await db.query(`
            SELECT * FROM sectors
        `)

        return result.rows
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar setores.')
    }
}

export async function postSector(req:FastifyRequest, res:FastifyReply) {
    const { name } = req.body

    try {
        await db.query(`
            INSERT INTO sectors
            (name)
            VALUES
            ($1)
        `, [name])

        res.code(200).send({ success: `Setor ${name} cadastrado com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao cadastrar setor.')
    }
}

export async function putSector(req:FastifyRequest, res:FastifyReply) {
    const { id, name, status } = req.body

    try {
        await db.query(`
            UPDATE sectors
            SET name = $1, status = $2
            WHERE id = $3
        `, [name, status, id])

        res.code(200).send({ success: `Setor ${name} editado com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao editar setor.')
    }
}

export async function deleteSector(req:FastifyRequest, res:FastifyReply) {
    const { id, name } = req.body

    try {
        await db.query(`
            DELETE FROM sectors
            WHERE id = $1
        `, [id])

        res.code(200).send({ success: `Setor ${name} excluído com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir setor.')
    }
}

export async function sectorsRoutes(fastify:FastifyInstance) {
    fastify.get('/sectors', { preHandler: [ authenticate ] }, getSectors);
    fastify.post('/sectors', { preHandler: [ authenticate, checkAdmin ] }, postSector);
    fastify.put('/sectors', { preHandler: [ authenticate, checkAdmin ] }, putSector);
    fastify.delete('/sectors', { preHandler: [ authenticate, checkAdmin ] }, deleteSector);
}
