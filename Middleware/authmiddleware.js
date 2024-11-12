const jwt = require('jsonwebtoken');
const pool = require('../Database/db');
const dotenv = require('dotenv');
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        const userQuery = 'SELECT role_id FROM users WHERE id = $1';
        const result = await pool.query(userQuery, [decoded.id]);
        
        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'User not found' });
        }
        req.user.role_id = result.rows[0].role_id;
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Invalid token' });
    }
};
const checkPermissions = (requiredPermissions) => {
  return async (req, res, next) => {
      try {
          const userRole = req.user.role_id;

          // Fetch permissions for the user's role
          const permissionQuery = `
              SELECT p.name
              FROM permissions p
              JOIN role_permissions rp ON p.id = rp.permission_id
              WHERE rp.role_id = $1
          `;
          const result = await client.query(permissionQuery, [userRole]);

          // Extract permission names from the result
          const userPermissions = result.rows.map(row => row.name);

          // Check if the user has the required permissions
          for (const permission of requiredPermissions) {
              if (!userPermissions.includes(permission)) {
                  return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
              }
          }

          next();
      } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Error checking permissions' });
      }
  };
};


module.exports = { authenticateJWT, checkPermissions };

