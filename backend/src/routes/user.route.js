import { Router } from 'express'
import verifyJwt from '../middlewares/auth.middleware.js';
import { getUser, loginUser, logutUser, refreshAccessToken, registerUser } from '../controllers/user.contoller.js';

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJwt, logutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/me').get(verifyJwt, getUser)


export default router;