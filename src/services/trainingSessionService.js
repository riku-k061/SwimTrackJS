const path = require('path');
const { 
  readData, 
  writeData, 
} = require('../utils/fileOps');
const { generateId} = require('../utils/idGenerator')
const { validateCoachId } = require('../models/validation/trainingSessionValidation');

const TRAINING_SESSIONS_FILE = path.join(__dirname, '../../data/trainingSessions.json');
const COACHES_FILE = path.join(__dirname, '../../data/coaches.json');
const SWIMMERS_FILE = path.join(__dirname, '../../data/swimmers.json');

const trainingSessionService = {
  /**
   * Get all training sessions
   */
  getAllSessions: async (filters = {}) => {
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    if (Object.keys(filters).length === 0) return sessions;
    return sessions.filter(session =>
      Object.entries(filters).every(([key, value]) => {
        if (key === 'dateFrom' && session.date >= value) return true;
        if (key === 'dateTo' && session.date <= value) return true;
        return session[key] === value;
      })
    );
  },
  
  /**
   * Get a training session by ID
   */
  getSessionById: async (id) => {
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    return sessions.find(s => s.id === id);
  },
  
  /**
   * Create a new training session
   */
  createSession: async (sessionData) => {
    // Validate the session data including coachId
    await validateCoachId(sessionData);
    
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    const newSession = {
      id: generateId(),
      attendees: [],
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...sessionData
    };
    
    sessions.push(newSession);
    await writeData(TRAINING_SESSIONS_FILE, sessions);
    
    return newSession;
  },
  
  /**
   * Update an existing training session
   */
  updateSession: async (id, updateData) => {
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    const index = sessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Training session with ID ${id} not found`);
    
    const current = sessions[index];
    const merged = { ...current, ...updateData };
    
    if (updateData.coachId && updateData.coachId !== current.coachId) {
      await validateCoachId(merged);
    }
    
    const updated = { ...current, ...updateData, updatedAt: new Date().toISOString() };
    sessions[index] = updated;
    await writeData(TRAINING_SESSIONS_FILE, sessions);
    
    
    return updated;
  },
  
  /**
   * Delete a training session
   */
  deleteSession: async (id) => {
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    
    const filtered = sessions.filter(s => s.id !== id);
    await writeData(TRAINING_SESSIONS_FILE, filtered);
    
    return { success: true, deletedId: id };
  },
  
  /**
   * Add a swimmer to a training session
   */
  addAttendee: async (sessionId, swimmerId) => {
    const swimmers = await readData(SWIMMERS_FILE);
    if (!swimmers.some(s => s.id === swimmerId)) {
      throw new Error(`Swimmer with ID ${swimmerId} not found`);
    }
    
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) throw new Error(`Training session with ID ${sessionId} not found`);
    
    const session = sessions[idx];
    if (session.attendees.length >= session.capacity) {
      throw new Error(`Session is at maximum capacity (${session.capacity})`);
    }
    if (session.attendees.includes(swimmerId)) {
      throw new Error(`Swimmer ${swimmerId} is already registered for this session`);
    }
    
    session.attendees.push(swimmerId);
    session.updatedAt = new Date().toISOString();
    sessions[idx] = session;
    await writeData(TRAINING_SESSIONS_FILE, sessions);
    
    
    return session;
  },
  
  /**
   * Remove a swimmer from a training session
   */
  removeAttendee: async (sessionId, swimmerId) => {
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) throw new Error(`Training session with ID ${sessionId} not found`);
    
    const session = sessions[idx];
    if (!session.attendees.includes(swimmerId)) {
      throw new Error(`Swimmer ${swimmerId} is not registered for this session`);
    }
    
    session.attendees = session.attendees.filter(id => id !== swimmerId);
    session.updatedAt = new Date().toISOString();
    sessions[idx] = session;
    await writeData(TRAINING_SESSIONS_FILE, sessions);
    
    return session;
  },
  
  /**
   * Get sessions by coach ID
   */
  getSessionsByCoach: async (coachId) => {
    const coaches = await readData(COACHES_FILE);
    if (!coaches.some(c => c.id === coachId)) {
      throw new Error(`Coach with ID ${coachId} not found`);
    }
    const sessions = await readData(TRAINING_SESSIONS_FILE);
    return sessions.filter(s => s.coachId === coachId);
  }
};

module.exports = trainingSessionService;
