import Fastify from "fastify"
import cors from "@fastify/cors";

const app = Fastify();

await app.register(cors, {
    origin: '*'
})

app.get('/', async (req, res) => {
    return { hello: 'world' };
})

async function start() {
    await app.listen({ port: 3009 });
    console.log('Servidor rodando na porta 3009')
}

start()