import jwt from 'jsonwebtoken'

const generateToken = (customerId) => {
    const token = jwt.sign(
        { id: customerId },
        process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026',
        { expiresIn: process.env.JWT_EXPIRY || '1d' }
    )

    return token
}

export default generateToken
