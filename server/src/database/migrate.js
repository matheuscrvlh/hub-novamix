import 'dotenv/config';
import { db } from "./database";
import { hashPassword } from "../utils/hash";
if (!process.env.NAME_SEED) {
    console.error('Nenhum nome de usuario padrao encontrado em .env');
}
else if (!process.env.LOGIN_SEED) {
    console.error('Nenhum login de usuario padrao encontrado em .env');
}
else if (!process.env.PASSWORD_SEED) {
    console.error('Nenhuma senha de usuario padrao encontrado em .env');
}
async function createTables() {
    try {
        const users = await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                login VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                status BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        const branchs = await db.query(`
            CREATE TABLE IF NOT EXISTS branchs (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                status BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        const users_branchs = await db.query(`
            CREATE TABLE IF NOT EXISTS user_branchs (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                branchs_id INT NOT NULL REFERENCES branchs(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                unique (user_id, branchs_id)
            )
        `);
        const modules = await db.query(`
            CREATE TABLE IF NOT EXISTS modules (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                slug VARCHAR(50) NOT NULL UNIQUE,
                public_link VARCHAR(255) NOT NULL UNIQUE,
                private_link VARCHAR(255) NOT NULL UNIQUE,
                image VARCHAR(255) NOT NULL,
                status BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        const user_permissions = await db.query(`
            CREATE TABLE IF NOT EXISTS user_permissions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
                access VARCHAR(20) DEFAULT 'read',
                granted_at TIMESTAMP DEFAULT NOW(),
                granted_by INT REFERENCES users(id) ON DELETE SET NULL,
                unique(user_id, module_id)
            )
        `);
        const logs = await db.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                entity_type VARCHAR(50) NOT NULL,
                entity_id INT NOT NULL,
                action VARCHAR(20) NOT NULL,
                field_changed VARCHAR(50),
                old_value TEXT,
                new_value TEXT,
                performed_by INT REFERENCES users(id) ON DELETE SET NULL,
                performed_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('tabelas criadas!');
    }
    catch (error) {
        console.error(error);
    }
}
async function userSeed() {
    try {
        const hashedPassword = await hashPassword(process.env.PASSWORD_SEED);
        const seedUser = await db.query(`
            INSERT INTO users
            (name, login, password)
            VALUES ($1, $2, $3)
        `, [process.env.NAME_SEED, process.env.LOGIN_SEED, hashedPassword]);
    }
    catch (error) {
        console.error(error);
    }
}
async function insertBranchs() {
    try {
        const insertPrado = await db.query(`
            INSERT INTO branchs (name) VALUES
                ('Novamix Prado'),
                ('Novamix Centro'),
                ('Novamix Olaria'),
                ('Novamix Teresopolis')
            ON CONFLICT (name) DO NOTHING
        `);
    }
    catch (error) {
        console.error(error);
    }
}
await createTables();
await userSeed();
await insertBranchs();
