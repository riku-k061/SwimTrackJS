// src/services/competitionParticipantService.js
const { v4: uuidv4 } = require('uuid');
const fileOps = require('../utils/fileOps');
const auditService = require('./auditService');
const { validateParticipant, validateParticipantEvent } = require('../models/validation/competitionParticipantValidation');
const competitionService = require('./competitionService');
const swimmerService = require('./swimmerService');

const PARTICIPANTS_FILE = 'data/competition-participants.json';

const participantService = {
  // Register a new participant for a competition
  register: async (participantData) => {
    const { value, error } = validateParticipant(participantData);
    if (error) throw error;
    
    // Check if competition exists
    const competition = await competitionService.getById(value.competitionId);
    if (!competition) {
      throw new Error('Competition not found');
    }
    
    // Check if competition registration is still open
    const now = new Date();
    const registrationDeadline = new Date(competition.registrationDeadline);
    if (now > registrationDeadline) {
      throw new Error('Registration deadline has passed for this competition');
    }
    
    // Check if swimmer exists
    const swimmer = await swimmerService.getById(value.swimmerId);
    if (!swimmer) {
      throw new Error('Swimmer not found');
    }
    
    // Check if all event IDs are valid for this competition
    const validEventIds = competition.events.map(event => event.id);
    const eventValidationErrors = [];
    
    value.events.forEach(event => {
      if (!validEventIds.includes(event.eventId)) {
        eventValidationErrors.push(`Event ID ${event.eventId} is not valid for this competition`);
      }
    });
    
    if (eventValidationErrors.length > 0) {
      throw new Error(`Invalid events: ${eventValidationErrors.join(', ')}`);
    }
    
    // Check if swimmer is already registered for this competition
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const existingParticipation = data.participants.find(p => 
      p.competitionId === value.competitionId && p.swimmerId === value.swimmerId
    );
    
    if (existingParticipation) {
      throw new Error('Swimmer is already registered for this competition');
    }
    
    // Create new participant record
    const newParticipant = {
      ...value,
      id: uuidv4(),
      registrationDate: value.registrationDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.participants.push(newParticipant);
    data._lastId += 1;
    
    await fileOps.writeData(PARTICIPANTS_FILE, data);
    
    return newParticipant;
  },
  
  // Get all participants for a competition
  getByCompetition: async (competitionId, includeSwimmerDetails = false) => {
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const participants = data.participants.filter(p => p.competitionId === competitionId);
    
    // If swimmer details are requested, fetch and include them
    if (includeSwimmerDetails && participants.length > 0) {
      const swimmerIds = participants.map(p => p.swimmerId);
      const swimmers = await Promise.all(swimmerIds.map(id => swimmerService.getById(id)));
      
      // Create a map of swimmer data for quicker lookups
      const swimmerMap = {};
      swimmers.forEach(swimmer => {
        if (swimmer) swimmerMap[swimmer.id] = swimmer;
      });
      
      // Add swimmer details to each participant
      return participants.map(p => ({
        ...p,
        swimmer: swimmerMap[p.swimmerId] || { id: p.swimmerId, note: 'Swimmer details not found' }
      }));
    }
    
    return participants;
  },
  
  // Get all competitions for a swimmer
  getBySwimmer: async (swimmerId, includeCompetitionDetails = false) => {
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const participations = data.participants.filter(p => p.swimmerId === swimmerId);
    
    // If competition details are requested, fetch and include them
    if (includeCompetitionDetails && participations.length > 0) {
      const competitionIds = participations.map(p => p.competitionId);
      const competitions = await Promise.all(competitionIds.map(id => competitionService.getById(id)));
      
      // Create a map of competition data for quicker lookups
      const competitionMap = {};
      competitions.forEach(competition => {
        if (competition) competitionMap[competition.id] = competition;
      });
      
      // Add competition details to each participation
      return participations.map(p => ({
        ...p,
        competition: competitionMap[p.competitionId] || { id: p.competitionId, note: 'Competition details not found' }
      }));
    }
    
    return participations;
  },
  
  // Get participant by ID
  getById: async (id) => {
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    return data.participants.find(p => p.id === id);
  },
  
  // Get participant by competition ID and swimmer ID
  getByCompetitionAndSwimmer: async (competitionId, swimmerId) => {
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    return data.participants.find(p => 
      p.competitionId === competitionId && p.swimmerId === swimmerId
    );
  },
  
  // Update a participant
  update: async (id, participantData) => {
    const { value, error } = validateParticipant({
      ...participantData,
      id // Add ID so validation knows this is an update
    });
    
    if (error) throw error;
    
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const index = data.participants.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Participant not found');
    }
    
    const existingParticipant = data.participants[index];
    
    // If changing events, validate them against competition
    if (value.events && value.events.length > 0) {
      const competition = await competitionService.getById(existingParticipant.competitionId);
      if (!competition) {
        throw new Error('Associated competition not found');
      }
      
      const validEventIds = competition.events.map(event => event.id);
      const eventValidationErrors = [];
      
      value.events.forEach(event => {
        if (!validEventIds.includes(event.eventId)) {
          eventValidationErrors.push(`Event ID ${event.eventId} is not valid for this competition`);
        }
      });
      
      if (eventValidationErrors.length > 0) {
        throw new Error(`Invalid events: ${eventValidationErrors.join(', ')}`);
      }
    }
    
    const updatedParticipant = {
      ...existingParticipant,
      ...value,
      id, // Ensure ID doesn't change
      competitionId: existingParticipant.competitionId, // Don't allow changing competition
      swimmerId: existingParticipant.swimmerId, // Don't allow changing swimmer
      updatedAt: new Date().toISOString()
    };
    
    data.participants[index] = updatedParticipant;
    
    await fileOps.writeData(PARTICIPANTS_FILE, data);
    
    return updatedParticipant;
  },
  
  // Add an event to a participant
  addEvent: async (participantId, eventData) => {
    const { value, error } = validateParticipantEvent(eventData);
    if (error) throw error;
    
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const participantIndex = data.participants.findIndex(p => p.id === participantId);
    
    if (participantIndex === -1) {
      throw new Error('Participant not found');
    }
    
    const participant = data.participants[participantIndex];
    
    // Check if competition exists
    const competition = await competitionService.getById(participant.competitionId);
    if (!competition) {
      throw new Error('Associated competition not found');
    }
    
    // Validate event ID
    const validEventIds = competition.events.map(event => event.id);
    if (!validEventIds.includes(value.eventId)) {
      throw new Error(`Event ID ${value.eventId} is not valid for this competition`);
    }
    
    // Check if swimmer is already registered for this event
    if (participant.events.some(e => e.eventId === value.eventId)) {
      throw new Error('Swimmer is already registered for this event');
    }
    
    // Add event to participant
    participant.events.push(value);
    participant.updatedAt = new Date().toISOString();
    
    await fileOps.writeData(PARTICIPANTS_FILE, data);
    
    return value;
  },
  
  // Update a participant event
  updateEvent: async (participantId, eventId, eventData) => {
    const { value, error } = validateParticipantEvent({
      ...eventData,
      eventId // Ensure eventId is preserved
    });
    
    if (error) throw error;
    
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const participantIndex = data.participants.findIndex(p => p.id === participantId);
    
    if (participantIndex === -1) {
      throw new Error('Participant not found');
    }
    
    const participant = data.participants[participantIndex];
    
    // Find the event in participant's events
    const eventIndex = participant.events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found for this participant');
    }
    
    // Update the event
    participant.events[eventIndex] = {
      ...participant.events[eventIndex],
      ...value,
      eventId // Ensure eventId doesn't change
    };
    
    participant.updatedAt = new Date().toISOString();
    
    await fileOps.writeData(PARTICIPANTS_FILE, data);
    
    return participant.events[eventIndex];
  },
  
  // Remove an event from a participant
  removeEvent: async (participantId, eventId) => {
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const participantIndex = data.participants.findIndex(p => p.id === participantId);
    
    if (participantIndex === -1) {
      throw new Error('Participant not found');
    }
    
    const participant = data.participants[participantIndex];
    
    // Find the event in participant's events
    const eventIndex = participant.events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found for this participant');
    }
    
    // Ensure participant has at least one event after removal
    if (participant.events.length <= 1) {
      throw new Error('Cannot remove last event - participant must be registered for at least one event');
    }
    
    // Remove the event
    const removedEvent = participant.events[eventIndex];
    participant.events.splice(eventIndex, 1);
    participant.updatedAt = new Date().toISOString();
    
    await fileOps.writeData(PARTICIPANTS_FILE, data);
    
    return { success: true, eventId };
  },
  
  // Remove a participant
  remove: async (id) => {
    const data = await fileOps.readData(PARTICIPANTS_FILE);
    const participantIndex = data.participants.findIndex(p => p.id === id);
    
    if (participantIndex === -1) {
      throw new Error('Participant not found');
    }
    
    const removedParticipant = data.participants[participantIndex];
    
    // Check if withdrawal is allowed (e.g., not after competition has started)
    const competition = await competitionService.getById(removedParticipant.competitionId);
    if (!competition) {
      throw new Error('Associated competition not found');
    }
    
    const now = new Date();
    const competitionStart = new Date(competition.startDate);
    if (now > competitionStart) {
      throw new Error('Cannot withdraw after competition has started');
    }
    
    // Remove the participant
    data.participants.splice(participantIndex, 1);
    
    await fileOps.writeData(PARTICIPANTS_FILE, data);
    
    return { success: true, id };
  },
  
  // Get stats about competition participants
  getCompetitionStats: async (competitionId) => {
    const participants = await participantService.getByCompetition(competitionId, true);
    const competition = await competitionService.getById(competitionId);
    
    if (!competition) {
      throw new Error('Competition not found');
    }
    
    // Create map of event participation
    const eventStats = {};
    competition.events.forEach(event => {
      eventStats[event.id] = {
        name: event.name,
        ageGroup: event.ageGroup,
        gender: event.gender,
        participantCount: 0,
        participants: []
      };
    });
    
    // Count participants per event
    participants.forEach(participant => {
      participant.events.forEach(event => {
        if (eventStats[event.eventId]) {
          eventStats[event.eventId].participantCount++;
          eventStats[event.eventId].participants.push({
            swimmerId: participant.swimmerId,
            name: participant.swimmer ? `${participant.swimmer.firstName} ${participant.swimmer.lastName}` : 'Unknown',
            seedTime: event.seedTime,
            status: event.status
          });
        }
      });
    });
    
    return {
      competition: {
        id: competition.id,
        name: competition.name,
        startDate: competition.startDate,
        endDate: competition.endDate
      },
      totalParticipants: participants.length,
      eventStats: Object.values(eventStats),
      registrationsByStatus: {
        registered: participants.filter(p => p.status === 'registered').length,
        checkedIn: participants.filter(p => p.status === 'checked-in').length,
        withdrawn: participants.filter(p => p.status === 'withdrawn').length,
        completed: participants.filter(p => p.status === 'completed').length
      },
      registrationsByPayment: {
        pending: participants.filter(p => p.paymentStatus === 'pending').length,
        paid: participants.filter(p => p.paymentStatus === 'paid').length,
        waived: participants.filter(p => p.paymentStatus === 'waived').length
      }
    };
  }
};

module.exports = participantService;
