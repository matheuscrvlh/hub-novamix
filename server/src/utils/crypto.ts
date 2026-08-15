import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey() {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY não encontrada no .env.')
    }

    return createHash('sha256').update(process.env.ENCRYPTION_KEY).digest()
}

export function encryptSecret(plainText: string): Buffer {
    const iv = randomBytes(12)
    const cipher = createCipheriv(ALGORITHM, getKey(), iv)
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted])
}

export function decryptSecret(data: Buffer): string {
    const iv = data.subarray(0, 12)
    const authTag = data.subarray(12, 28)
    const encrypted = data.subarray(28)

    const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

    return decrypted.toString('utf8')
}
