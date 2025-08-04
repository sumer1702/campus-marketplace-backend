
// Firebase Authentication Middleware
const { auth } = require('../firebaseAdmin');

/**
 * Middleware to verify Firebase ID token and restrict to @email.iimcal.ac.in
 */
const firebaseAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'No token provided',
      error: 'MISSING_TOKEN'
    });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email || '';
    
    // Email domain restriction (can be disabled for testing)
    const allowedDomains = process.env.ALLOWED_DOMAINS 
      ? process.env.ALLOWED_DOMAINS.split(',')
      : ['@email.iimcal.ac.in'];
    
    const isAllowedDomain = allowedDomains.some(domain => email.endsWith(domain));
    
    if (!isAllowedDomain && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        message: 'Access restricted to authorized domains',
        error: 'INVALID_DOMAIN'
      });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = firebaseAuth;
