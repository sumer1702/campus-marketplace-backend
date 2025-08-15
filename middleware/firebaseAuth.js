
// Firebase Authentication Middleware
const { auth } = require('../firebaseAdmin');

/**
 * Middleware to verify Firebase ID token and restrict to @email.iimcal.ac.in
 */
const firebaseAuth = async (req, res, next) => {
  console.log(`[auth] 🔍 ${req.method} ${req.path} - checking authentication...`);
  
  // Allow OPTIONS requests (preflight) without authentication
  if (req.method === 'OPTIONS') {
    console.log('[auth] ✅ OPTIONS request, skipping auth');
    return next();
  }
  
  const authHeader = req.headers.authorization;
  console.log('[auth] 🔑 Auth header:', authHeader ? 'Bearer [REDACTED]' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[auth] ❌ No token provided');
    return res.status(401).json({ 
      message: 'No token provided',
      error: 'MISSING_TOKEN'
    });
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  console.log('[auth] 🎯 Token extracted, length:', idToken ? idToken.length : 0);
  
  try {
    console.log('[auth] 🔐 Verifying Firebase token...');
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email || '';
    
    console.log('[auth] ✅ Token verified! User:', { uid: decodedToken.uid, email });
    
    // Email domain restriction (can be disabled for testing)
    const allowedDomains = process.env.ALLOWED_DOMAINS 
      ? process.env.ALLOWED_DOMAINS.split(',')
      : ['@email.iimcal.ac.in'];
    
    const isAllowedDomain = allowedDomains.some(domain => email.endsWith(domain));
    
    if (!isAllowedDomain && process.env.NODE_ENV === 'production') {
      console.log('[auth] ❌ Domain not allowed:', email);
      return res.status(403).json({ 
        message: 'Access restricted to authorized domains',
        error: 'INVALID_DOMAIN'
      });
    }
    
    console.log('[auth] ✅ Setting req.user and continuing...');
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log('[auth] ❌ Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = firebaseAuth;
