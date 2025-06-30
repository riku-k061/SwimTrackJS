// middleware/authorize.js
const { PERMISSIONS, ROLE_PERMISSIONS } = require('../models/authorization/roles');
const coachService = require('../services/coachService');
const swimmerService = require('../services/swimmerService');

/**
 * Check if user has the required permission
 * @param {String|Array} requiredPermissions - Permission(s) to check
 * @returns {Function} Middleware function
 */
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Ensure user property exists (set by authenticate middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const { role } = req.user;
      
      // Convert single permission to array
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];
      
      // Get permissions for this role
      const userPermissions = ROLE_PERMISSIONS[role] || [];
      
      // Check if user has all required permissions
      const hasPermission = permissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (hasPermission) {
        return next();
      }
      
      // If user doesn't have global permission, check for context-specific permissions
      if (await checkContextualPermission(req, permissions)) {
        return next();
      }
      
      // User doesn't have permission
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false, 
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Check for context-specific permissions based on relationship to resource
 * @param {Object} req - Express request
 * @param {Array} permissions - Required permissions
 * @returns {Promise

boolean>} Whether user has contextual permission
 */
async function checkContextualPermission(req, permissions) {
  const { user } = req;
  const { role, entityId } = user;
  
  // Coach managing their own swimmers
  if (role === 'coach' && permissions.includes(PERMISSIONS.MANAGE_OWN_SWIMMERS)) {
    // Check if operation involves a swimmer assigned to this coach
    const swimmerId = req.params.id || req.body.swimmerId;
    
    if (swimmerId && entityId) {
      try {
        // Check if the swimmer is assigned to this coach
        const swimmer = await swimmerService.getSwimmerById(swimmerId);
        if (swimmer && swimmer.coachId === entityId) {
          return true;
        }
      } catch (error) {
        console.error('Error checking swimmer-coach relationship:', error);
        return false;
      }
    }
    
    // For bulk operations, check if all swimmers are assigned to this coach
    if (req.body.swimmerIds && req.body.swimmerIds.length > 0 && entityId) {
      try {
        // We'll allow this if the coach is adding/removing their own swimmers
        const operation = req.path.includes('bulk-assign-coach') ? 'assign' : 'unassign';
        
        if (operation === 'assign') {
          // For bulk assign, the coach can only manage their own swimmers
          const currentCoachSwimmers = await swimmerService.getSwimmersByCoach(entityId);
          const currentSwimmerIds = currentCoachSwimmers.data.map(s => s.id);
          
          // Check if all swimmers in the request are already assigned to this coach
          const allSwimmersAreAssigned = req.body.swimmerIds.every(id => 
            currentSwimmerIds.includes(id)
          );
          
          return allSwimmersAreAssigned;
        } else if (operation === 'unassign') {
          // For bulk unassign, coach can only unassign swimmers from themselves
          return req.body.coachId === entityId;
        }
      } catch (error) {
        console.error('Error checking bulk assignment permission:', error);
        return false;
      }
    }
  }
  
  // Program manager with specific group access (e.g., by age group or level)
  if (role === 'program_manager' && user.managedGroups) {
    // Implement group-based permission logic here
    // This would check if the swimmers involved are in the manager's groups
  }
  
  return false;
}

/**
 * Middleware to check if user owns the resource or has admin rights
 * @param {Function} getResourceOwnerIdFn - Function to get owner ID from request
 * @returns {Function} Middleware function
 */
const authorizeOwner = (getResourceOwnerIdFn) => {
  return async (req, res, next) => {
    try {
      // Admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get owner ID for the resource
      const ownerId = await getResourceOwnerIdFn(req);
      
      // Check if user owns the resource
      if (req.user.id === ownerId) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false, 
        message: 'Authorization error'
      });
    }
  };
};

module.exports = {
  authorize,
  authorizeOwner
};