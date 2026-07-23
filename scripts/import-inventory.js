"use strict";

// Azzurro Hotel — Property, Room & Bathroom Inventory Import
// Idempotent upsert. Safe to run more than once.
// Usage: node scripts/import-inventory.js [--dry-run]
// Access codes NOT included — they must be securely imported separately.

require('dotenv/config');

const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_ID = `import_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

const db = new Database(
  path.join(__dirname, '..', process.env.DATABASE_URL ? '..' : '.', 'dev.db')
    .replace('file:', '').replace('./', '')
);

// Fix path
const dbPath = path.resolve(__dirname, '..', 'dev.db');
const db2 = new Database(dbPath);

// ── Utility Functions ────────────────────────────────────────────────

function stableId(propertyCode, type, identifier) {
  const sanitized = identifier.toString().toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const prefix = propertyCode.toUpperCase().replace(/[^A-Z_]/g, '_');
  return `${prefix}:${type}_${sanitized}`.replace(/__+/g, '_').replace(/:_/g, ':');
}

function jsonStr(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val.startsWith('[') || val.startsWith('{') ? val : JSON.stringify(val);
  return JSON.stringify(val);
}

function now() { return new Date().toISOString(); }

let insertCount = 0, updateCount = 0, logEntries = [];

function logEntry(entityType, action, oldData, newData, summary) {
  logEntries.push({
    id: crypto.randomUUID(),
    entityType, entityId: 'batch',
    action, changedByEmail: 'import_script',
    changedByName: 'Import Script', source: 'system',
    summary, oldData: oldData ? JSON.stringify(oldData) : null,
    newData: newData ? JSON.stringify(newData) : null,
    batchId: BATCH_ID, createdAt: now()
  });
}

const insertLog = db2.prepare(`INSERT INTO AuditLog
  (id, entityType, entityId, action, changedByEmail, changedByName, source, summary, oldData, newData, batchId, createdAt)
  VALUES (@id, @entityType, @entityId, @action, @changedByEmail, @changedByName, @source, @summary, @oldData, @newData, @batchId, @createdAt)`);

function flushLogs() {
  const batch = logEntries.splice(0);
  for (const e of batch) {
    insertLog.run(e);
  }
}

// ── Property helpers ──────────────────────────────────────────────────

const findPropByCode = db2.prepare('SELECT * FROM Property WHERE code = ?');
const insertProp = db2.prepare(`INSERT INTO Property
  (id, name, code, aliases, address, closestStations, timezone, cloudbedsPropertyId, capacity,
   declaredBeds, declaredRooms, declaredBathrooms, declaredPrivateBathrooms, declaredSharedBathrooms,
   verificationStatus, active, notes, createdAt, updatedAt)
  VALUES (@id, @name, @code, @aliases, @address, @closestStations, @timezone, @cloudbedsPropertyId, @capacity,
   @declaredBeds, @declaredRooms, @declaredBathrooms, @declaredPrivateBathrooms, @declaredSharedBathrooms,
   @verificationStatus, @active, @notes, @createdAt, @updatedAt)`);

function upsertProp(propData) {
  const existing = findPropByCode.get(propData.code);
  if (existing) {
    const updateData = {};
    const fields = ['name','aliases','address','closestStations','timezone','cloudbedsPropertyId','capacity',
      'declaredBeds','declaredRooms','declaredBathrooms','declaredPrivateBathrooms','declaredSharedBathrooms',
      'notes'];
    for (const f of fields) {
      if (propData[f] !== undefined && propData[f] !== existing[f]) {
        updateData[f] = propData[f];
      }
    }
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = now();
      const sets = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
      const vals = Object.keys(updateData).map(k => updateData[k]);
      db2.prepare(`UPDATE Property SET ${sets} WHERE id = ?`).run(...vals, existing.id);
      updateCount++;
      logEntry('property', 'UPDATE', existing, {...existing, ...updateData}, `Updated property ${propData.code}`);
    }
    return existing.id;
  } else {
    const id = crypto.randomUUID();
    const fullData = {
      id,
      name: propData.name,
      code: propData.code,
      aliases: jsonStr(propData.aliases ? (Array.isArray(propData.aliases) ? propData.aliases : JSON.parse(propData.aliases)) : null),
      address: propData.address || null,
      closestStations: jsonStr(propData.closestStations ? (Array.isArray(propData.closestStations) ? propData.closestStations : JSON.parse(propData.closestStations)) : null),
      timezone: propData.timezone || 'Australia/Sydney',
      cloudbedsPropertyId: propData.cloudbedsPropertyId || null,
      capacity: propData.capacity || 0,
      declaredBeds: propData.declaredBeds || null,
      declaredRooms: propData.declaredRooms || null,
      declaredBathrooms: propData.declaredBathrooms || null,
      declaredPrivateBathrooms: propData.declaredPrivateBathrooms || null,
      declaredSharedBathrooms: propData.declaredSharedBathrooms || null,
      verificationStatus: propData.verificationStatus || 'imported_unverified',
      active: 1,
      notes: propData.notes || null,
      createdAt: now(),
      updatedAt: now()
    };
    insertProp.run(fullData);
    insertCount++;
    logEntry('property', 'CREATE', null, fullData, `Created property ${propData.code}`);
    return id;
  }
}

// ── Room helpers ──────────────────────────────────────────────────────

const findRoom = db2.prepare('SELECT * FROM Room WHERE normalizedRoomKey = ?');

function upsertRoom(propCode, propId, roomData) {
  const key = stableId(propCode, 'ROOM', roomData.room);
  const existing = findRoom.get(key);

  const data = {
    propertyId: propId,
    propertyCode: propCode,
    roomNumber: String(roomData.room),
    normalizedRoomKey: key,
    building: roomData.building || null,
    floor: roomData.floor || null,
    bedCount: roomData.bed_count || null,
    bedDescription: roomData.bed_description || null,
    roomType: roomData.room_type || null,
    roomSize: roomData.room_size || null,
    bathroomArrangement: roomData.bathroom_arrangement || null,
    isEnsuite: roomData.bathroom_arrangement === 'ensuite' ? 1 : 0,
    isDetachedPrivate: roomData.bathroom_arrangement === 'detached_private' ? 1 : 0,
    hasSharedBathroom: roomData.bathroom_arrangement === 'shared' ? 1 : 0,
    ownerOccupied: roomData.owner_occupied ? 1 : 0,
    cleaningRequired: roomData.cleaning_required !== false ? 1 : 0,
    fridge: roomData.fridge ? 1 : 0,
    airConditioning: roomData.air_conditioning || null,
    storage: roomData.storage || null,
    rcdBedsidePlugs: roomData.rcd_bedside_plugs !== undefined ? (roomData.rcd_bedside_plugs ? 1 : 0) : null,
    roomSetup: roomData.room_setup || null,
    operationalNotes: roomData.operational_note || null,
    verificationStatus: roomData.verification_status || 'imported_unverified',
    active: 1
  };

  if (existing) {
    const updates = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== existing[k]) updates[k] = v;
    }
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = now();
      const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const vals = Object.keys(updates).map(k => updates[k]);
      db2.prepare(`UPDATE Room SET ${sets} WHERE id = ?`).run(...vals, existing.id);
      updateCount++;
      logEntry('room', 'UPDATE', existing, {...existing, ...updates}, `Updated room ${key}`);
    }
    return existing.id;
  } else {
    const id = crypto.randomUUID();
    data.id = id;
    data.createdAt = now();
    data.updatedAt = now();
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const vals = fields.map(k => data[k]);
    db2.prepare(`INSERT INTO Room (${fields.join(', ')}) VALUES (${placeholders})`).run(...vals);
    insertCount++;
    logEntry('room', 'CREATE', null, data, `Created room ${key}`);
    return id;
  }
}

// ── Bathroom/Facility helpers ─────────────────────────────────────────

const findFacility = db2.prepare("SELECT * FROM Facility WHERE propertyCode = ? AND name = ? AND type = 'bathroom'");

function upsertBathroom(propCode, propId, bathroomData) {
  const existing = findFacility.get(propCode, bathroomData.identifier);
  const data = {
    propertyId: propId,
    propertyCode: propCode,
    type: 'bathroom',
    name: bathroomData.identifier,
    bathroomType: bathroomData.type || 'unknown',
    building: bathroomData.building || null,
    floor: bathroomData.floor || null,
    locationDescription: bathroomData.location || null,
    assignedRoomId: bathroomData.assigned_room || null,
    isShared: bathroomData.type && bathroomData.type.startsWith('shared') ? 1 : 0,
    isPrivate: ['detached_private', 'ensuite'].includes(bathroomData.type) ? 1 : 0,
    isEnsuite: bathroomData.type === 'ensuite' ? 1 : 0,
    showerCount: bathroomData.shower_count || null,
    toiletCount: bathroomData.toilet_count || null,
    cleaningRequired: bathroomData.cleaning_required !== false ? 1 : 0,
    ownerOccupied: bathroomData.owner_occupied ? 1 : 0,
    active: 1,
    verificationStatus: bathroomData.verification_status || 'imported_unverified',
    maintenanceNotes: bathroomData.maintenance_note || bathroomData.note || null,
    notes: bathroomData.note || null
  };

  if (existing) {
    const updates = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== existing[k]) updates[k] = v;
    }
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = now();
      const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const vals = Object.keys(updates).map(k => updates[k]);
      db2.prepare(`UPDATE Facility SET ${sets} WHERE id = ?`).run(...vals, existing.id);
      updateCount++;
      logEntry('facility', 'UPDATE', existing, {...existing, ...updates}, `Updated bathroom ${bathroomData.identifier} @ ${propCode}`);
    }
    return existing.id;
  } else {
    const id = crypto.randomUUID();
    data.id = id;
    data.createdAt = now();
    data.updatedAt = now();
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const vals = fields.map(k => data[k]);
    db2.prepare(`INSERT INTO Facility (${fields.join(', ')}) VALUES (${placeholders})`).run(...vals);
    insertCount++;
    logEntry('facility', 'CREATE', null, data, `Created bathroom ${bathroomData.identifier} @ ${propCode}`);
    return id;
  }
}

// ══════════════════════════════════════════════════════════════════════
//  PROPERTY DATA
// ══════════════════════════════════════════════════════════════════════

const PROPERTIES = [
  // ── A. CENTRAL SYDNEY ──────────────────────────────────────────────
  {
    code: 'CENTRAL_SYDNEY',
    name: 'Central Sydney',
    aliases: ['Central', 'Wentworth', '90 Wentworth', '90WA'],
    address: '90 Wentworth Avenue, Surry Hills, NSW 2010',
    closestStations: ['Central Station', 'Museum Station'],
    cloudbedsPropertyId: '311267',
    capacity: 48,
    declaredBeds: 48,
    declaredRooms: 12,
    declaredBathrooms: 6,
    declaredPrivateBathrooms: 3,
    declaredSharedBathrooms: 3,
    verificationStatus: 'conflicting_data',
    notes: 'Declared 12 rooms but 11 listed. Declared 6 bathrooms (3 private + 3 shared) but 4 shared bathrooms + 3 ensuites listed (=7 total). Flagged for review.',
    rooms: [
      { room: "101", bed_count: 4, floor: "1st level", room_type: "4 people ensuite", room_size: "spacious", bathroom_arrangement: "ensuite", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "102", bed_count: 6, floor: "1st level", room_type: "6 people shared", room_size: "spacious", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "103", bed_count: 4, floor: "1st level", room_type: "4 people shared", room_size: "spacious", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "104", bed_count: 4, floor: "1st level", room_type: "4 people shared", room_size: "spacious", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "201", bed_count: 6, floor: "2nd level", room_type: "6 people shared", room_size: "spacious", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "202", bed_count: 2, floor: "2nd level", room_type: "2 people shared", room_size: "spacious", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "203", bed_count: 2, floor: "2nd level", room_type: "2 people shared", room_size: "spacious", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "204", bed_count: 6, floor: "2nd level", room_type: "6 people shared", room_size: "small", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "205", bed_count: 6, floor: "2nd level", room_type: "6 people shared", room_size: "small", bathroom_arrangement: "shared", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: false },
      { room: "206", bed_count: 6, floor: "2nd level", room_type: "6 people ensuite", room_size: "small", bathroom_arrangement: "ensuite", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
      { room: "207", bed_count: 2, floor: "2nd level", room_type: "2 people ensuite", room_size: "spacious", bathroom_arrangement: "ensuite", air_conditioning: "wall-mounted aircon", rcd_bedside_plugs: true },
    ],
    sharedBathrooms: [
      { identifier: "Bathroom 1", location: "Next to dining area", floor: "1st level", type: "shared_full_bathroom" },
      { identifier: "Bathroom 2", location: "Next to dining area", floor: "1st level", type: "shared_full_bathroom" },
      { identifier: "Bathroom 3", location: "Next to dining area", floor: "1st level", type: "shared_full_bathroom" },
      { identifier: "Bathroom 4", location: "Next to Room 207", floor: "2nd level", type: "shared_full_bathroom", maintenance_note: "Front door does not close." },
    ],
    ensuiteRoomNumbers: ["101", "206", "207"],
  },

  // ── B. POTTS POINT ─────────────────────────────────────────────────
  {
    code: 'POTTS_POINT',
    name: 'Potts Point',
    aliases: ['Victoria Street', '141 Victoria', '143 Victoria', '141VS'],
    address: '141 Victoria Street, Potts Point, NSW 2011',
    closestStations: ['Kings Cross Station'],
    cloudbedsPropertyId: '311272',
    capacity: 107,
    declaredBeds: 107,
    declaredRooms: 27,
    declaredBathrooms: 5,
    verificationStatus: 'conflicting_data',
    notes: 'Declared 5 bathrooms (2 showers, 2 toilets) but 6 facilities listed (5 toilets + 1 shower). Flagged for review.',
    rooms: [
      { room: "1", bed_count: 2, building: "143", floor: "Basement", room_type: "Shared Dormitory with 2 Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "2", bed_count: 6, building: "143", floor: "Basement", room_type: "Shared Dormitory with 6 Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "3", bed_count: 2, building: "143", floor: "Basement", room_type: "Shared Dormitory with 2 Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "4", bed_count: 4, building: "143", floor: "Ground floor", room_type: "Shared Dormitory with 4 Beds", room_size: "small", bathroom_arrangement: "shared" },
      { room: "5", bed_count: 4, building: "143", floor: "Ground floor", room_type: "Shared Dormitory with 4 Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "6", bed_count: 4, building: "143", floor: "Ground floor", room_type: "Shared Dormitory with 4 Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "7", bed_count: 4, building: "143", floor: "1st floor", room_type: "Shared Dormitory with 4 Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "8", bed_count: 4, building: "143", floor: "1st floor", room_type: "Shared Dormitory with 4 Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "9", bed_count: 6, building: "143", floor: "1st floor", room_type: "Shared Dormitory with 6 Beds", room_size: "spacious", bathroom_arrangement: "shared", fridge: true },
      { room: "204", bed_count: 4, building: "141", floor: "Ground floor", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "204A", bed_count: 4, building: "141a", floor: "Ground floor", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "305", bed_count: 4, building: "141", floor: "1st floor", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "305A", bed_count: 4, building: "141a", floor: "1st floor", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "301", bed_count: 6, building: "141", floor: "1st floor", room_type: "Shared Dormitory with 3 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared", fridge: true },
      { room: "301A", bed_count: 6, building: "141a", floor: "1st floor", room_type: "Shared Dormitory with 3 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared", fridge: true },
      { room: "302", bed_count: 4, building: "141", floor: "1st floor", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "302A", bed_count: 4, building: "141a", floor: "1st floor", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "303", bed_count: 1, building: "141", floor: "1st floor", room_type: "Single bed", room_size: "small", bathroom_arrangement: "shared" },
      { room: "304", bed_count: 2, building: "141", floor: "1st floor", room_type: "Shared Dormitory with 1 Bunk Bed", room_size: "small", bathroom_arrangement: "shared" },
      { room: "304A", bed_count: 2, building: "141a", floor: "1st floor", room_type: "Shared Dormitory with 1 Bunk Bed", room_size: "small", bathroom_arrangement: "shared" },
      { room: "101", bed_count: 6, building: "141", floor: "Basement", room_type: "Shared Dormitory with 3 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared", fridge: true },
      { room: "101A", bed_count: 6, building: "141a", floor: "Basement", room_type: "Shared Dormitory with 3 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared", fridge: true },
      { room: "102", bed_count: 4, building: "141", floor: "Basement", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "small", bathroom_arrangement: "shared" },
      { room: "102A", bed_count: 4, building: "141a", floor: "Basement", room_type: "Shared Dormitory with 2 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "103", bed_count: 6, building: "141", floor: "Basement", room_type: "Shared Dormitory with 3 Bunk Beds", room_size: "spacious", bathroom_arrangement: "shared", fridge: true },
      { room: "104", bed_count: 2, building: "141", floor: "Outside", room_type: "Shared Dormitory with 1 Bunk Bed", room_size: "small", bathroom_arrangement: "shared" },
      { room: "105", bed_count: 2, building: "141", floor: "Outside", room_type: "Shared Dormitory with 1 Bunk Bed", room_size: "small", bathroom_arrangement: "shared" },
    ],
    sharedBathrooms: [
      { identifier: "Toilet 1", location: "Next to Room 304A", floor: "2nd level", building: "141a", type: "shared_toilet" },
      { identifier: "Toilet 2", location: "Next to Room 204", floor: "1st level", building: "141", type: "shared_toilet" },
      { identifier: "Toilet 3", location: "Next to Room 204A", floor: "1st level", building: "141a", type: "shared_toilet" },
      { identifier: "Shower 4", location: "Next to Room 102A", floor: "Lower level", building: "141a", type: "shared_shower" },
      { identifier: "Toilet 5", location: "Next to Room 4", floor: "1st level", building: "143", type: "shared_toilet" },
      { identifier: "Toilet 6", location: "Next to Room 7", floor: "2nd level", building: "143", type: "shared_toilet" },
    ],
    ensuiteRoomNumbers: [],
  },

  // ── C. SURRY HILLS ─────────────────────────────────────────────────
  {
    code: 'SURRY_HILLS',
    name: 'Surry Hills',
    aliases: ['Flinders', '82 Flinders', 'Darlinghurst', '82FL'],
    address: '82 Flinders Street, Darlinghurst, NSW 2010',
    closestStations: ['Museum Station', 'Central Station'],
    cloudbedsPropertyId: '311134',
    capacity: 72,
    declaredBeds: 74,
    declaredRooms: 24,
    declaredBathrooms: 16,
    declaredPrivateBathrooms: 11,
    declaredSharedBathrooms: 4,
    verificationStatus: 'conflicting_data',
    notes: 'Declared 74 beds but rooms total 72? Declared 11 private bathrooms. Room 18 has contradictory bathroom info. Rooms 9-11 require no cleaning.',
    rooms: [
      { room: "1", bed_count: 4, floor: "Ground floor", room_type: "4 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "2 underbed drawers" },
      { room: "2", bed_count: 4, floor: "1st floor", room_type: "4 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "3 underbed drawers" },
      { room: "3", bed_count: 4, floor: "2nd floor", room_type: "4 people room", bathroom_arrangement: "shared", storage: "2 underbed drawers" },
      { room: "4", bed_count: 2, floor: "2nd floor", room_type: "2 people room with balcony", bathroom_arrangement: "shared", storage: "2 underbed drawers" },
      { room: "5", bed_count: 2, floor: "2nd floor", room_type: "2 people room with balcony", bathroom_arrangement: "shared", storage: "2 underbed drawers" },
      { room: "6", bed_count: 4, floor: "3rd floor", room_type: "4 people room", bathroom_arrangement: "shared", storage: "3 underbed drawers" },
      { room: "7", bed_count: 2, floor: "2nd floor", room_type: "2 people room", bathroom_arrangement: "shared", storage: "2 underbed drawers", fridge: true },
      { room: "8", bed_count: 2, floor: "2nd floor", room_type: "2 people room", bathroom_arrangement: "shared", storage: "2 underbed drawers", fridge: true },
      { room: "9", bed_description: "1 Double", bed_count: 2, floor: "Ground floor", room_type: "2 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "2 underbed drawers", cleaning_required: false, operational_note: "NO CLEANING SERVICE REQUIRED" },
      { room: "10", bed_description: "1 Double", bed_count: 2, floor: "Ground floor", room_type: "2 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "2 underbed drawers", cleaning_required: false, operational_note: "NO CLEANING SERVICE REQUIRED" },
      { room: "11", bed_description: "1 Double", bed_count: 2, floor: "Ground floor", room_type: "2 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "1 underbed drawer", cleaning_required: false, operational_note: "NO CLEANING SERVICE REQUIRED" },
      { room: "12", bed_description: "1 Double", bed_count: 2, floor: "Ground floor", room_type: "2 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "2 underbed drawers" },
      { room: "13", bed_count: 6, floor: "1st floor - in front of kitchen", room_type: "6 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "6 underbed drawers" },
      { room: "14", bed_description: "1 Double", bed_count: 4, floor: "1st floor - in front of kitchen", room_type: "4 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "4 underbed drawers", verification_status: "conflicting_data" },
      { room: "15", bed_count: 4, floor: "Ground floor", room_type: "4 people room", bathroom_arrangement: "shared", storage: "3 underbed drawers" },
      { room: "16", bed_count: 4, floor: "Ground floor", room_type: "4 people room", bathroom_arrangement: "shared", storage: "3 underbed drawers" },
      { room: "17", bed_count: 6, floor: "Ground floor", room_type: "6 people room with private bathroom", bathroom_arrangement: "ensuite", storage: "4 underbed drawers" },
      { room: "18", bed_count: 4, floor: "1st floor", room_type: "4 people room with private bathroom", bathroom_arrangement: "shared", storage: "3 underbed drawers", verification_status: "conflicting_data", operational_note: "Room type says private bathroom, but bathroom field says shared bathroom." },
      { room: "19", bed_count: 4, floor: "2nd floor", room_type: "4 people room", bathroom_arrangement: "shared", storage: "3 underbed drawers" },
      { room: "20", bed_count: 2, floor: "2nd floor", room_type: "2 people room with balcony", bathroom_arrangement: "shared", storage: "2 underbed drawers" },
      { room: "21", bed_count: 2, floor: "2nd floor", room_type: "2 people room with balcony", bathroom_arrangement: "shared", storage: "0 underbed drawers" },
      { room: "22", bed_count: 4, floor: "2nd floor", room_type: "4 people room", bathroom_arrangement: "shared", storage: "2 underbed drawers" },
      { room: "23", bed_count: 2, floor: "2nd floor", room_type: "2 people room", bathroom_arrangement: "shared", storage: "2 underbed drawers", fridge: true },
      { room: "24", bed_count: 2, floor: "2nd floor", room_type: "2 people room", bathroom_arrangement: "shared", storage: "2 underbed drawers", fridge: true },
    ],
    sharedBathrooms: [
      { identifier: "Bathroom 1", location: "Next to Room 4", floor: "1st level", type: "shared_full_bathroom" },
      { identifier: "Bathroom 2", location: "Next to Room 8", floor: "2nd level", type: "shared_full_bathroom" },
      { identifier: "Bathroom 3", location: "Next to Room 21", floor: "1st level", type: "shared_full_bathroom" },
      { identifier: "Bathroom 4", location: "Next to Room 24", floor: "2nd level", type: "shared_full_bathroom" },
      { identifier: "Toilet 1", location: "Next to Room 14 and dining area", floor: "1st level", type: "shared_toilet" },
    ],
    ensuiteRoomNumbers: null, // computed below from bathroom_arrangement
  },

  // ── D. DARLING HARBOUR ─────────────────────────────────────────────
  {
    code: 'DARLING_HARBOUR',
    name: 'Darling Harbour',
    aliases: ['Allen', 'Allen Street', '22 Allen', 'Pyrmont Allen', '22AL'],
    address: '22 Allen Street, Pyrmont, NSW 2009',
    closestStations: ['Convention Station', 'Pyrmont Bay Station'],
    cloudbedsPropertyId: '311271',
    capacity: 176,
    declaredBeds: 176,
    declaredRooms: 28,
    declaredBathrooms: 24,
    declaredPrivateBathrooms: 7,
    verificationStatus: 'imported_unverified',
    notes: '24 total bathrooms: 7 private (ensuites) + 8 toilets + 3 showers + 6 combined = 24. Internally consistent.',
    rooms: [
      { room: "1", bed_count: 6, floor: "Ground floor", room_type: "6 people ensuite", room_size: "spacious", bathroom_arrangement: "ensuite", room_setup: "Toilet roll holder" },
      { room: "2", bed_count: 4, floor: "Ground floor", room_type: "4 people ensuite - 2 bunk beds", room_size: "small", bathroom_arrangement: "ensuite", room_setup: "Toilet roll holder" },
      { room: "3", bed_count: 8, floor: "Ground floor", room_type: "8 people ensuite", room_size: "spacious", bathroom_arrangement: "ensuite", room_setup: "Toilet roll holder" },
      { room: "4", bed_count: 6, floor: "Outside 1st floor", room_type: "6 people shared bathroom", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "5", bed_count: 6, floor: "Outside 1st floor", room_type: "6 people shared bathroom", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "6", bed_count: 14, floor: "Outside 1st floor", room_type: "4 and 10 people connected rooms", room_size: "spacious", bathroom_arrangement: "ensuite", operational_note: "Two connected rooms." },
      { room: "7", bed_count: 6, floor: "1st floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "8", bed_count: 4, floor: "1st floor", room_type: "4 people shared bathroom - 2 bunk beds", room_size: "small", bathroom_arrangement: "shared" },
      { room: "9", bed_count: 4, floor: "1st floor", room_type: "4 people shared bathroom - 2 bunk beds", room_size: "small", bathroom_arrangement: "shared" },
      { room: "10", bed_count: 4, floor: "1st floor", room_type: "4 people shared bathroom - 2 bunk beds", room_size: "spacious", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "11", bed_count: 4, floor: "1st floor", room_type: "4 people shared bathroom - 2 bunk beds", room_size: "spacious", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "12", bed_count: 4, floor: "1st floor", room_type: "4 people shared bathroom - 2 bunk beds", room_size: "small", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "13", bed_count: 6, floor: "1st floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "small", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "14", bed_count: 6, floor: "1st floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "15", bed_count: 6, floor: "1st floor", room_type: "6 people room", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "16", bed_count: 6, floor: "1st floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "small", bathroom_arrangement: "shared" },
      { room: "17", bed_count: 6, floor: "Outside 2nd floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "spacious", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "18", bed_count: 6, floor: "Outside 2nd floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "19", bed_count: 14, floor: "Outside 2nd floor", room_type: "14 people ensuite", room_size: "small", bathroom_arrangement: "ensuite" },
      { room: "20", bed_count: 6, floor: "2nd floor", room_type: "6 people room", room_size: "small", bathroom_arrangement: "ensuite" },
      { room: "21", bed_count: 8, floor: "2nd floor", room_type: "8 people shared bathroom - 4 bunk beds", room_size: "small", bathroom_arrangement: "shared" },
      { room: "22", bed_count: 4, floor: "2nd floor", room_type: "4 people shared bathroom - 2 bunk beds", room_size: "spacious", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "23", bed_count: 6, floor: "2nd floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "spacious", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "24", bed_count: 8, floor: "2nd floor", room_type: "8 people shared bathroom - 4 bunk beds", room_size: "spacious", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "25", bed_count: 6, floor: "2nd floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "small", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "26", bed_count: 6, floor: "2nd floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "small", bathroom_arrangement: "shared", room_setup: "Toilet roll holder" },
      { room: "27", bed_count: 6, floor: "2nd floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "small", bathroom_arrangement: "shared" },
      { room: "28", bed_count: 6, floor: "2nd floor", room_type: "6 people shared bathroom - 3 bunk beds", room_size: "spacious", bathroom_arrangement: "shared" },
    ],
    sharedBathrooms: [
      { identifier: "Toilet 1", location: "Next to Room 2", floor: "Ground floor", type: "shared_toilet" },
      { identifier: "Toilet 2", location: "In front of Room 3", floor: "Ground floor", type: "shared_toilet" },
      { identifier: "Toilet 3", location: "Next to Room 5", floor: "1st floor", type: "shared_toilet" },
      { identifier: "Shower 4", location: "Next to Room 5", floor: "1st floor", type: "shared_shower" },
      { identifier: "Bathroom 5", location: "In front of Room 14", floor: "1st floor", type: "combined_shower_toilet" },
      { identifier: "Bathroom 6", location: "In front of Room 14", floor: "1st floor", type: "combined_shower_toilet" },
      { identifier: "Toilet 7", location: "In front of Room 14", floor: "1st floor", type: "shared_toilet" },
      { identifier: "Bathroom 8", location: "In front of Room 9", floor: "1st floor", type: "combined_shower_toilet" },
      { identifier: "Toilet 9", location: "Next to Room 16", floor: "1st floor", type: "shared_toilet" },
      { identifier: "Toilet 11", location: "Next to Room 18", floor: "2nd floor", type: "shared_toilet" },
      { identifier: "Shower 12", location: "Next to Room 19", floor: "2nd floor", type: "shared_shower" },
      { identifier: "Bathroom 13", location: "In front of Room 27", floor: "2nd floor", type: "combined_shower_toilet" },
      { identifier: "Bathroom 14", location: "In front of Room 27", floor: "2nd floor", type: "combined_shower_toilet" },
      { identifier: "Toilet 15", location: "In front of Room 26", floor: "2nd floor", type: "shared_toilet" },
      { identifier: "Bathroom 16", location: "In front of Room 23", floor: "2nd floor", type: "combined_shower_toilet" },
      { identifier: "Toilet 17", location: "Next to Room 20", floor: "2nd floor", type: "shared_toilet" },
      { identifier: "Shower 18", location: "Next to Room 28", floor: "2nd floor", type: "shared_shower" },
    ],
    ensuiteRoomNumbers: ["1", "2", "3", "6", "15", "19", "20"],
  },

  // ── E. OLYMPIC HOTEL ───────────────────────────────────────────────
  {
    code: 'OLYMPIC',
    name: 'Olympic Hotel',
    aliases: ['Olympic', 'Moore Park', '308 Moore Park'],
    address: '308 Moore Park, Paddington, NSW 2021',
    closestStations: ['Moore Park Light Rail Station', 'Allianz Stadium'],
    cloudbedsPropertyId: null,
    capacity: 0,
    declaredRooms: 30,
    verificationStatus: 'imported_unverified',
    notes: '6 owner-occupied rooms. 11 detached bathrooms. Room 26 is on 2nd level but assigned to Bathroom A1 on 1st floor — flagged for verification.',
    rooms: [
      { room: "1", floor: "1st level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "2", floor: "1st level", room_type: "Private Room with Detached Private Bathroom", bathroom_arrangement: "detached_private" },
      { room: "3", floor: "1st level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "4", floor: "1st level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "5", floor: "1st level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "6", floor: "1st level", room_type: "Private Room with Detached Private Bathroom", bathroom_arrangement: "detached_private" },
      { room: "7", floor: "1st level", room_type: "Owner Occupied", owner_occupied: true, cleaning_required: false },
      { room: "8", floor: "1st level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "9", floor: "1st level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "10", floor: "1st level", room_type: "Private Room with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "11", floor: "1st level", room_type: "Private Room with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "12", floor: "1st level", room_type: "Owner Occupied", owner_occupied: true, cleaning_required: false },
      { room: "13", floor: "1st level", room_type: "Private Room with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "14", floor: "1st level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "15", floor: "2nd level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "16", floor: "2nd level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "17", floor: "2nd level", room_type: "Private Room with Detached Private Bathroom", bathroom_arrangement: "detached_private" },
      { room: "18", floor: "2nd level", room_type: "Private Room with Detached Private Bathroom", bathroom_arrangement: "detached_private" },
      { room: "19", floor: "2nd level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "20", floor: "2nd level", room_type: "Owner Occupied", owner_occupied: true, cleaning_required: false },
      { room: "21", floor: "2nd level", room_type: "Private Room with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "22", floor: "2nd level", room_type: "Owner Occupied", owner_occupied: true, cleaning_required: false },
      { room: "23", floor: "2nd level", room_type: "Owner Occupied", owner_occupied: true, cleaning_required: false },
      { room: "24", floor: "2nd level", room_type: "Private Room with Detached Private Bathroom", bathroom_arrangement: "detached_private" },
      { room: "25", floor: "2nd level", room_type: "Owner Occupied", owner_occupied: true, cleaning_required: false },
      { room: "26", floor: "2nd level", room_type: "Private Room with Detached Private Bathroom", bathroom_arrangement: "detached_private" },
      { room: "27", floor: "2nd level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "28", floor: "2nd level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "29", floor: "2nd level", room_type: "Private Studio with Ensuite Bathroom", bathroom_arrangement: "ensuite" },
      { room: "30", floor: "2nd level", room_type: "KR and Private Room with Detached Private Bathroom", bathroom_arrangement: "detached_private" },
    ],
    sharedBathrooms: [],
    detachedBathrooms: [
      { identifier: "Bathroom A1", assigned_room: "26", floor: "1st floor", type: "detached_private", verification_status: "needs_review", note: "Room 26 is listed on the second level while Bathroom A1 is listed on the first floor." },
      { identifier: "Bathroom B1", assigned_room: "6", floor: "1st floor", type: "detached_private" },
      { identifier: "Bathroom C1", assigned_room: "7", floor: "1st floor", type: "owner_occupied", owner_occupied: true, cleaning_required: false },
      { identifier: "Bathroom D1", assigned_room: "2", floor: "1st floor", type: "detached_private" },
      { identifier: "Bathroom E1", assigned_room: "12", floor: "1st floor", type: "owner_occupied", owner_occupied: true, cleaning_required: false, note: "No code. Follow up Lisa." },
      { identifier: "Bathroom F1", assigned_room: null, floor: "1st floor", type: "unknown", verification_status: "needs_review", note: "No room assignment and no code. Follow up Lisa." },
      { identifier: "Bathroom A2", assigned_room: "30", floor: "2nd floor", type: "detached_private" },
      { identifier: "Bathroom B2", assigned_room: "17", floor: "2nd floor", type: "detached_private" },
      { identifier: "Bathroom C2", assigned_room: "18", floor: "2nd floor", type: "detached_private" },
      { identifier: "Bathroom D2", assigned_room: "23", floor: "2nd floor", type: "owner_occupied", owner_occupied: true, cleaning_required: false },
      { identifier: "Bathroom E2", assigned_room: "24", floor: "2nd floor", type: "detached_private" },
    ],
    ensuiteRoomNumbers: null, // computed from bathroom_arrangement
  },

  // ── F. THE PYRMONT BUDGET HOTEL ────────────────────────────────────
  {
    code: 'PYRMONT_BUDGET',
    name: 'The Pyrmont Budget Hotel',
    aliases: ['Pyrmont Budget', '11 Pyrmont Bridge', 'Venus', '11BR'],
    address: '11 Pyrmont Bridge, Pyrmont, NSW 2009',
    closestStations: ['Convention Station', 'Pyrmont Bay Station'],
    cloudbedsPropertyId: '311268',
    capacity: 14,
    declaredBeds: 18,
    declaredRooms: 14,
    declaredBathrooms: 13,
    declaredPrivateBathrooms: 12,
    declaredSharedBathrooms: 1,
    verificationStatus: 'conflicting_data',
    notes: '14 rooms × 2 beds = 28 beds, but declared 18. 11 rooms with ensuite, not 12 private bathrooms. Flagged for review.',
    rooms: [
      { room: "1", bed_count: 2, floor: "Ground floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "2", bed_count: 2, floor: "Ground floor", room_type: "Budget room for 2 - shared bathroom", room_size: "small", bathroom_arrangement: "shared" },
      { room: "3", bed_count: 2, floor: "1st floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "4", bed_count: 2, floor: "1st floor", room_type: "Budget Family - ensuite room", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "5", bed_count: 2, floor: "1st floor", room_type: "Budget Family Room - shared bathroom", room_size: "spacious", bathroom_arrangement: "shared" },
      { room: "6", bed_count: 2, floor: "2nd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "7", bed_count: 2, floor: "2nd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "8", bed_count: 2, floor: "2nd floor", room_type: "Budget Family Room - shared bathroom", room_size: "small", bathroom_arrangement: "shared" },
      { room: "9", bed_count: 2, floor: "2nd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "small", bathroom_arrangement: "ensuite" },
      { room: "10", bed_count: 2, floor: "2nd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "11", bed_count: 2, floor: "3rd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "spacious", bathroom_arrangement: "ensuite" },
      { room: "12", bed_count: 2, floor: "3rd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "small", bathroom_arrangement: "ensuite" },
      { room: "13", bed_count: 2, floor: "3rd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "small", bathroom_arrangement: "ensuite" },
      { room: "14", bed_count: 2, floor: "3rd floor", room_type: "Budget room for 2 - ensuite bathroom", room_size: "spacious", bathroom_arrangement: "ensuite" },
    ],
    sharedBathrooms: [
      { identifier: "Shared Bathroom 1", location: "Beside Room 5", floor: "1st floor", type: "multi_fixture_shared_bathroom", shower_count: 3, toilet_count: 2 },
    ],
    ensuiteRoomNumbers: ["1", "3", "4", "6", "7", "9", "10", "11", "12", "13", "14"],
  },
];

// ══════════════════════════════════════════════════════════════════════
//  MAIN IMPORT LOGIC
// ══════════════════════════════════════════════════════════════════════

function runImport() {
  console.log('\n═══════════════════════════════════════════');
  console.log(`  Azzurro Hotel — Inventory Import`);
  console.log(`  Batch: ${BATCH_ID}`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════\n');

  db2.exec('BEGIN');

  const results = [];

  for (const prop of PROPERTIES) {
    console.log(`\n--- ${prop.name} (${prop.code}) ---`);
    console.log(`  Rooms to import: ${prop.rooms.length}`);
    console.log(`  Shared bathrooms: ${prop.sharedBathrooms.length}`);
    if (prop.detachedBathrooms) {
      console.log(`  Detached bathrooms: ${prop.detachedBathrooms.length}`);
    }

    // Upsert Property
    const propId = upsertProp(prop);
    console.log(`  Property ID: ${propId}`);

    // Upsert Rooms
    let roomCount = 0;
    for (const room of prop.rooms) {
      upsertRoom(prop.code, propId, room);
      roomCount++;
    }
    console.log(`  Rooms processed: ${roomCount}`);

    // Create ensuite bathroom records
    const ensuiteRooms = prop.ensuiteRoomNumbers
      ? prop.rooms.filter(r => prop.ensuiteRoomNumbers.includes(r.room))
      : prop.rooms.filter(r => r.bathroom_arrangement === 'ensuite');

    for (const room of ensuiteRooms) {
      upsertBathroom(prop.code, propId, {
        identifier: `Ensuite ${room.room}`,
        location: `Ensuite in Room ${room.room}`,
        floor: room.floor,
        type: 'ensuite',
        assigned_room: room.room,
        cleaning_required: room.cleaning_required !== false,
        owner_occupied: room.owner_occupied || false,
      });
    }
    console.log(`  Ensuite bathrooms created: ${ensuiteRooms.length}`);

    // Upsert shared bathrooms
    for (const bath of prop.sharedBathrooms) {
      upsertBathroom(prop.code, propId, bath);
    }
    console.log(`  Shared bathrooms processed: ${prop.sharedBathrooms.length}`);

    // Upsert detached bathrooms (Olympic only)
    if (prop.detachedBathrooms) {
      for (const bath of prop.detachedBathrooms) {
        upsertBathroom(prop.code, propId, bath);
      }
      console.log(`  Detached bathrooms processed: ${prop.detachedBathrooms.length}`);
    }

    // Calculate validation
    const importedBeds = prop.rooms.reduce((s, r) => s + (r.bed_count || 0), 0);
    const declaredBeds = prop.declaredBeds || 0;
    if (importedBeds !== declaredBeds) {
      console.log(`  ⚠ Bed count mismatch: imported=${importedBeds}, declared=${declaredBeds}`);
    }

    results.push({
      property: prop.code,
      roomsImported: prop.rooms.length,
      declaredRooms: prop.declaredRooms,
      bedsImported: importedBeds,
      declaredBeds,
      bathroomsImported: prop.sharedBathrooms.length + ensuiteRooms.length + (prop.detachedBathrooms || []).length,
      declaredBathrooms: prop.declaredBathrooms,
    });
  }

  flushLogs();

  if (DRY_RUN) {
    console.log('\n=== DRY RUN COMPLETE — ROLLING BACK ===');
    db2.exec('ROLLBACK');
  } else {
    db2.exec('COMMIT');
  }

  console.log('\n=== Summary ===');
  console.log(`Inserted: ${insertCount}`);
  console.log(`Updated: ${updateCount}`);
  console.log(`Audit entries: ${logEntries.length}`);
  console.log(`Batch ID: ${BATCH_ID}`);

  for (const r of results) {
    console.log(`  ${r.property}: ${r.roomsImported}/${r.declaredRooms} rooms, ${r.bedsImported}/${r.declaredBeds} beds, ${r.bathroomsImported}/${r.declaredBathrooms || '?'} bathrooms`);
  }

  // Print conflicts
  console.log('\n=== Conflicts Requiring Human Review ===');
  const conflicts = [
    { prop: 'CENTRAL_SYDNEY', issue: '11 rooms listed vs 12 declared. 4 shared bathrooms + 3 ensuites = 7 total vs 6 declared.' },
    { prop: 'POTTS_POINT', issue: '5 toilets + 1 shower = 6 facilities listed vs 5 bathrooms declared.' },
    { prop: 'SURRY_HILLS', issue: 'Rooms 9, 10, 11: need cleaning_required: false. Room 18: room_type says private, bathroom says shared. Room 14: 1 Double bed but bed_count=4.' },
    { prop: 'DARLING_HARBOUR', issue: 'Room 6 reports 14 beds (two connected rooms). Verify if this counts as 1 or 2 rooms.' },
    { prop: 'OLYMPIC', issue: 'Room 26 (2nd floor) assigned to Bathroom A1 (1st floor). Bathrooms F1 and E1 need follow-up.' },
    { prop: 'PYRMONT_BUDGET', issue: '14 rooms × 2 beds = 28 beds sum, but declared 18. 11 ensuite rooms vs 12 private bathrooms declared.' },
  ];
  for (const c of conflicts) {
    console.log(`  ${c.prop}: ${c.issue}`);
  }

  db2.close();
  console.log('\nDone.');
}

runImport();
