import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';

const JWT_SECRET = 'your_jwt_secret_here';

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token provided' 
        });
    }
    const token = authHeader.split(' ')[1];
  // verify
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error('JWT VERIFICATION FAILED', err);
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token or expred' 
        });
    }
}
