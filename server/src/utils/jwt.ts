import jwt from 'jsonwebtoken'

export function generateToken(sub: number, role: string, permissions: Permissions[], branchs: Branch[]) {
    const payload = {
        sub: sub,
        role: role,
        permissions,
        branchs
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    return token
}

export function verifyToken(token: string) {
    const verifiedPayload = jwt.verify(token, process.env.JWT_SECRET)

    console.log(verifiedPayload)
    return verifiedPayload
}