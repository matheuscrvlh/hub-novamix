import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../database/database.ts';
import { authenticate } from '../middlewares/auth.middlewares.ts';

const CHECKLIST_ITEMS = [
    { key: 'cisspoder', label: 'Conta no CissPoder' },
    { key: 'discord', label: 'Conta Discord' },
    { key: 'webmail', label: 'Conta Webmail' },
    { key: 'hub', label: 'Conta Hub' },
    { key: 'ciss', label: 'Conta Ciss S.A' }
];

// logins que são avisados quando alguém envia um check-list
const CHECKLIST_RECIPIENTS = ['marlon', 'miguel.capille'];

type ChecklistItem = {
    key: string;
    label: string;
    received: boolean;
}

type ChecklistBody = {
    items?: { key: string; received: boolean }[];
    observation?: string;
}

type NotificationBody = {
    id: number;
}

async function isRecipient(userId: number) {
    const result = await db.query(`
        SELECT id FROM users
        WHERE id = $1 AND LOWER(login) = ANY($2)
    `, [userId, CHECKLIST_RECIPIENTS]);

    return result.rows.length > 0
}

async function checkRecipient(req:FastifyRequest, res:FastifyReply) {
    if (!(await isRecipient(req.user.sub))) {
        return res.code(403).send({ error: 'Usuário não liberado.' })
    }
}

async function getMyChecklist(req:FastifyRequest, res:FastifyReply) {
    try {
        const lastSearch = await db.query(`
            SELECT items, observation, created_at
            FROM checklists
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        `, [req.user.sub]);

        const last = lastSearch.rows[0];

        const items = CHECKLIST_ITEMS.map((item) => ({
            ...item,
            received: last?.items.some((sent: ChecklistItem) => sent.key === item.key && sent.received) ?? false
        }));

        res.code(200).send({
            recipient: await isRecipient(req.user.sub),
            sent_at: last?.created_at ?? null,
            observation: last?.observation ?? '',
            items
        })
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao buscar check-list.')
    }
}

async function postChecklist(req:FastifyRequest<{Body: ChecklistBody}>, res:FastifyReply) {
    const sent = req.body?.items ?? []
    const observation = req.body?.observation?.trim() || null

    // os itens sempre saem da lista do servidor, o client só diz o que recebeu
    const items = CHECKLIST_ITEMS.map((item) => ({
        ...item,
        received: sent.some((s) => s.key === item.key && s.received === true)
    }));

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO checklists
            (user_id, items, observation)
            VALUES
            ($1, $2, $3)
            RETURNING id
        `, [req.user.sub, JSON.stringify(items), observation]);

        await client.query(`
            INSERT INTO checklist_notifications
            (checklist_id, user_id)
            SELECT $1, id FROM users
            WHERE LOWER(login) = ANY($2) AND status = true
        `, [result.rows[0].id, CHECKLIST_RECIPIENTS]);

        await client.query('COMMIT');

        res.code(201).send({ success: 'Check-list enviado com sucesso.' })
    } catch(error) {
        await client.query('ROLLBACK');
        console.error(error);
        throw new Error('Erro ao enviar check-list.')
    } finally {
        client.release();
    }
}

async function getChecklists(req:FastifyRequest, res:FastifyReply) {
    try {
        const result = await db.query(`
            SELECT c.id, c.items, c.observation, c.created_at, u.name AS user_name, u.login AS user_login, s.name AS sector_name
            FROM checklists AS c
            JOIN users AS u ON u.id = c.user_id
            LEFT JOIN sectors AS s ON s.id = u.sector_id
            ORDER BY c.created_at DESC
            LIMIT 100
        `);

        res.code(200).send(result.rows)
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao buscar check-lists.')
    }
}

async function getNotifications(req:FastifyRequest, res:FastifyReply) {
    try {
        const result = await db.query(`
            SELECT n.id, n.checklist_id, n.created_at, c.items, u.name AS user_name
            FROM checklist_notifications AS n
            JOIN checklists AS c ON c.id = n.checklist_id
            JOIN users AS u ON u.id = c.user_id
            WHERE n.user_id = $1 AND n.read_at IS NULL
            ORDER BY n.created_at DESC
        `, [req.user.sub]);

        res.code(200).send(result.rows)
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao buscar notificações.')
    }
}

async function readNotification(req:FastifyRequest<{Body: NotificationBody}>, res:FastifyReply) {
    const { id } = req.body

    try {
        await db.query(`
            UPDATE checklist_notifications
            SET read_at = NOW()
            WHERE id = $1 AND user_id = $2
        `, [id, req.user.sub]);

        res.code(200).send({ success: 'Notificação lida.' })
    } catch(error) {
        console.error(error);
        throw new Error('Erro ao marcar notificação como lida.')
    }
}

export async function checklistsRoutes(fastify: FastifyInstance) {
    fastify.get('/checklists/me', { preHandler: [authenticate] }, getMyChecklist);
    fastify.post('/checklists', { preHandler: [authenticate] }, postChecklist);
    fastify.get('/checklists', { preHandler: [authenticate, checkRecipient] }, getChecklists);

    fastify.get('/checklists/notifications', { preHandler: [authenticate] }, getNotifications);
    fastify.put('/checklists/notifications', { preHandler: [authenticate] }, readNotification);
}
