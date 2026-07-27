import jwt from 'jsonwebtoken'

export function generateToken(sub: number, role: string) {
    const payload = {
        sub: sub,
        role: role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token
}

export function verifyToken(token: string) {
    const verifiedPayload = jwt.verify(token, process.env.JWT_SECRET)

    return verifiedPayload
}