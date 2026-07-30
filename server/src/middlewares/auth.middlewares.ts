import type { FastifyRequest, FastifyReply, fastify } from 'fastify';
import { verifyToken } from '../utils/jwt.ts';

declare module 'fastify' {
    interface FastifyRequest {
        user: any
    }
}

export async function authenticate(req:FastifyRequest, res:FastifyReply) {
    const authHeader = req.headers['authorization'];
    const token = req.cookies.token ?? authHeader?.split(' ')[1];

    if(!token) {
        return res.code(401).send({ error: 'Autorização não encontrada.' });
    }

    req.user = await verifyToken(token)
}

export async function checkAdmin(req:FastifyRequest, res:FastifyReply) {
    const role = req.user.role

    if (role === 'admin') {
        return null 
    } else {
        res.code(401).send({ message: 'Usuário não liberado.'})
    }
}