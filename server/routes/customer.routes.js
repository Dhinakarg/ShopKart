import express from 'express'
import { registerCustomer, loginCustomer, getMyProfile, logoutCustomer, changePassword } from '../controllers/customer.controller.js'
import isAuthenticated from '../middlewares/auth.middleware.js'

const customerRoutes = express.Router()

customerRoutes.post('/register', registerCustomer)

customerRoutes.post('/login', loginCustomer)

customerRoutes.get('/me', isAuthenticated, getMyProfile)

customerRoutes.post('/logout', isAuthenticated, logoutCustomer)

customerRoutes.patch('/change-password', isAuthenticated, changePassword)

export default customerRoutes
