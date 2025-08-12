import { verifyToken } from '../utils/jwt.utils';

export const protect = async (req) => {
  try {

    const token = req.cookies.get('token');

    if (!token) {
      return new Response('Not authorized', { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token.value);
    if (!decoded) {
      return new Response('Not authorized', { status: 401 });
    }

    
    req.user = decoded;
    return null;
  } catch (error) {
    return new Response('Not authorized', { status: 401 });
  }
}; 