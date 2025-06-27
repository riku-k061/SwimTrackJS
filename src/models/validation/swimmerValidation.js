// src/models/validation/swimmerValidation.js

const { getEntities } = require('../../db');
const { readData } = require('../../utils/fileOps');
const path = require('path');

let clubsCache = null, clubsCacheExpiry = 0;
const CACHE_TTL = 60_000;

const getClubs = async () => {
  if (Date.now()<clubsCacheExpiry && clubsCache) return clubsCache;
  const clubs = await readData(path.join(__dirname,'../../../data/clubs.json'))||[];
  clubsCache = clubs; clubsCacheExpiry = Date.now()+CACHE_TTL;
  return clubs;
};

const validateSwimmerSchema = s => {
  const errs = [];
  if (!s.firstName?.trim()) errs.push('First name is required');
  if (!s.lastName?.trim()) errs.push('Last name is required');
  if (!s.email) errs.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) errs.push('Invalid email format');
  if (!s.dob) errs.push('Date of birth is required');
  else if (isNaN(new Date(s.dob).getTime())) errs.push('Invalid date format');
  if (s.clubId && typeof s.clubId!=='string') errs.push('Club ID must be a string');
  return errs;
};

const validateSwimmerBusinessRules = s => {
  const errs = [];
  const dob = new Date(s.dob);
  if (!isNaN(dob.getTime())) {
    const today = new Date();
    let age = today.getFullYear()-dob.getFullYear();
    const m = today.getMonth()-dob.getMonth();
    if (m<0 || (m===0 && today.getDate()<dob.getDate())) age--;
    if (age<5) errs.push('Swimmer must be at least 5 years old');
    if (age>100) errs.push('Swimmer must be under 100 years old');
  }
  return errs;
};

const validateSwimmerAgainstDB = async (s, isUpdate=false) => {
  const errs = [];
  const swimmers = await getEntities('swimmers');
  if (s.email) {
    const exists = swimmers.some(x =>
      x.email.toLowerCase()===s.email.toLowerCase() &&
      (!isUpdate || x.id!==s.id)
    );
    if (exists) errs.push('Email address is already in use');
  }
  if (s.clubId) {
    const clubs = await getClubs();
    if (!clubs.some(c=>c.id===s.clubId)) errs.push('Club does not exist');
  }
  return errs;
};

const validateSwimmer = async (s, isUpdate=false) => {
  let errs = validateSwimmerSchema(s);
  if (errs.length) return errs;
  errs = validateSwimmerBusinessRules(s);
  if (errs.length) return errs;
  return validateSwimmerAgainstDB(s, isUpdate);
};

module.exports = { validateSwimmer };
