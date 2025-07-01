// middleware/coachAssignmentAuthorize.js
const { PERMISSIONS } = require('../models/authorization/roles');
const coachService = require('../services/coachService');
const swimmerService = require('../services/swimmerService');

/**
 * Middleware to authorize coach assignment operations
 */
const authorizeCoachAssignment = async (req, res, next) => {
  try {
    const { user } = req;
    const { role, entityId } = user;
    
    // Admins can do any coach assignment
    if (role === 'admin') {
      return next();
    }
    
    // Program managers can do any coach assignment if they have the permission
    if (role === 'program_manager' && 
        user.permissions && 
        user.permissions.includes(PERMISSIONS.ASSIGN_COACH)) {
      return next();
    }
    
    // For single swimmer assignment/unassignment
    const swimmerId = req.params.id;
    const coachId = req.body.coachId; // For assignment
    
    // If it's a coach doing the operation
    if (role === 'coach') {
      // Coaches can only manage their own swimmers
      const swimmer = await swimmerService.getSwimmerById(swimmerId);
      
      // Check operation type
      const isAssignOperation = req.method === 'PUT'; // PUT /swimmers/:id/coach
      const isUnassignOperation = req.method === 'DELETE'; // DELETE /swimmers/:id/coach
      
      if (isAssignOperation) {
        // For assignment, coach can only assign swimmers to themselves
        if (coachId !== entityId) {
          return res.status(403).json({
            success: false,
            message: 'Coaches can only assign swimmers to themselves'
          });
        }
        
        // Additionally, check if the swimmer already has a coach
        if (swimmer.coachId && swimmer.coachId !== entityId) {
          return res.status(403).json({
            success: false,
            message: 'Cannot assign swimmer that is already assigned to another coach'
          });
        }
        
        return next();
      }
      
      if (isUnassignOperation) {
        // For unassignment, coaches can only unassign their own swimmers
        if (swimmer.coachId !== entityId) {
          return res.status(403).json({
            success: false,
            message: 'Coaches can only unassign their own swimmers'
          });
        }
        
        return next();
      }
    }
    
    // For bulk operations, we need special handling
    if (req.path.includes('bulk-assign-coach') || req.path.includes('bulk-remove-coach')) {
      // Only admins and program managers can do bulk operations by default
      if (role !== 'admin' && role !== 'program_manager') {
        return res.status(403).json({
          success: false,
          message: 'Only admins and program managers can perform bulk coach assignments'
        });
      }
      
      // Additional checks could be added here for program managers
      // e.g., checking if they have authority over the specific groups of swimmers
      
      return next();
    }
    
    // If we get here, the user doesn't have permission
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this coach assignment operation'
    });
  } catch (error) {
    console.error('Coach assignment authorization error:', error);
    return res.status(500).json({
      success: false, 
      message: 'Authorization error'
    });
  }
};

module.exports = {
  authorizeCoachAssignment
};