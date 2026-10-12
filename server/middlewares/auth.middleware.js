import jwt from 'jsonwebtoken'
import Customer from '../models/customer.model.js'

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null)

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated' })
        }

        const secret = process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026'
        const decoded = jwt.verify(token, secret)
        const customer = await Customer.findById(decoded.id).select('-password')

        if (!customer) {
            return res.status(401).json({ success: false, message: 'Not authenticated' })
        }
        
        req.user = customer
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
}

export default isAuthenticated
export { isAuthenticated }
