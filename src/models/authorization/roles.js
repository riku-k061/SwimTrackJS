const ROLES = {
  ADMIN: 'admin',
  COACH: 'coach',
  ASSISTANT_COACH: 'assistant_coach',
  PROGRAM_MANAGER: 'program_manager',
  SWIMMER: 'swimmer',
  GUARDIAN: 'guardian',
  GUEST: 'guest'
};

const PERMISSIONS = {
  ASSIGN_COACH: 'assign_coach',
  UNASSIGN_COACH: 'unassign_coach',
  REASSIGN_COACH: 'reassign_coach',
  BULK_ASSIGN_COACH: 'bulk_assign_coach',
  CREATE_COACH: 'create_coach',
  DELETE_COACH: 'delete_coach',
  VIEW_AUDIT_LOGS: 'view_audit_logs'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.COACH]: [PERMISSIONS.ASSIGN_COACH, PERMISSIONS.UNASSIGN_COACH],
  [ROLES.PROGRAM_MANAGER]: [PERMISSIONS.BULK_ASSIGN_COACH, PERMISSIONS.VIEW_AUDIT_LOGS],
  [ROLES.SWIMMER]: [],
  [ROLES.GUEST]: []
};

module.exports = { ROLES, PERMISSIONS, ROLE_PERMISSIONS };
