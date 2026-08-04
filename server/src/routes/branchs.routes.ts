import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { authenticate, checkAdmin } from '../middlewares/auth.middlewares.ts';

export async function getBranchs() {
    try {
        const result = await db.query(`
            SELECT * FROM branchs
        `)

        return result.rows
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar filiais.')
    }
}

export async function postBranch(req:FastifyRequest, res:FastifyReply) {
    const { name } = req.body

    try {
        await db.query(`
            INSERT INTO branchs
            (name)
            VALUES
            ($1)
        `, [name])

        res.code(200).send({ success: `Filial ${name} cadastrada com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao cadastrar filial.')
    }
}

export async function putBranch(req:FastifyRequest, res:FastifyReply) {
    const { id, name, status } = req.body

    try {
        await db.query(`
            UPDATE branchs
            SET name = $1, status = $2
            WHERE id = $3
        `, [name, status, id])

        res.code(200).send({ success: `Filial ${name} editada com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao editar filial.')
    }
}

export async function deleteBranch(req:FastifyRequest, res:FastifyReply) {
    const { id, name } = req.body

    try {
        await db.query(`
            DELETE FROM branchs
            WHERE id = $1
        `, [id])

        res.code(200).send({ success: `Filial ${name} excluída com sucesso.`})
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao excluir filial.')
    }
}

export async function branchsRoutes(fastify:FastifyInstance) {
    fastify.get('/branchs', { preHandler: [ authenticate ] }, getBranchs);
    fastify.post('/branchs', { preHandler: [ authenticate, checkAdmin ] }, postBranch);
    fastify.put('/branchs', { preHandler: [ authenticate, checkAdmin ] }, putBranch);
    fastify.delete('/branchs', { preHandler: [ authenticate, checkAdmin ] }, deleteBranch);
}