const { v4: uuidv4 } = require('uuid');

// Function to generate a unique ID for a coach
const generateId = () => {
  return uuidv4(); // Generate a random UUID (version 4)
};

module.exports = { generateId };
