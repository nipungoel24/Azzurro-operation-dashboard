import { prisma } from '../lib/prisma';
import { createAuditLog, SOURCES } from './audit';

const FACILITY_TYPES = [
  'bathroom',
  'kitchen',
  'kitchen_cabinet',
  'fridge',
  'laundry_area',
  'laundry_lint_filter',
  'reception',
  'common_area',
  'vent',
  'air_conditioner',
  'bed_frame',
  'curtain_rod',
  'go_key_device',
  'laundry_pod_station',
  'room',
  'other',
];

export async function seedDefaultProperties() {
  const defaults = [
    { name: 'Potts Point', code: 'POTTS', cloudbedsPropertyId: '311272', capacity: 107 },
    { name: 'Surry Hills', code: 'SURRY', cloudbedsPropertyId: '311134', capacity: 72 },
    { name: 'Darling Harbour', code: 'DARL', cloudbedsPropertyId: '311271', capacity: 176 },
    { name: 'Central Sydney', code: 'CENT', cloudbedsPropertyId: '311267', capacity: 48 },
    { name: 'The Pyrmont Budget Hotel', code: 'PYRM', cloudbedsPropertyId: '311268', capacity: 14 },
    { name: 'Olympic Hotel', code: 'OLYM', capacity: 0 },
  ];

  for (const prop of defaults) {
    const existing = await prisma.property.findFirst({ where: { name: prop.name } });
    if (!existing) {
      await prisma.property.create({ data: prop });
    }
  }
}

export async function getProperties() {
  return await prisma.property.findMany({ orderBy: { name: 'asc' } });
}

export async function getProperty(id) {
  return await prisma.property.findUnique({ where: { id } });
}

export async function createFacility(data, user) {
  const facility = await prisma.facility.create({ data });
  await createAuditLog({
    entityType: 'facility', entityId: facility.id, action: 'CREATE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI, summary: `Created facility: ${facility.name}`,
    newData: JSON.stringify(facility),
  });
  return facility;
}

export async function updateFacility(id, data, user) {
  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) return null;
  const facility = await prisma.facility.update({ where: { id }, data });
  await createAuditLog({
    entityType: 'facility', entityId: facility.id, action: 'UPDATE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI, summary: `Updated facility: ${facility.name}`,
    oldData: JSON.stringify(existing), newData: JSON.stringify(facility),
  });
  return facility;
}

export async function deleteFacility(id, user) {
  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) return null;
  await prisma.facility.delete({ where: { id } });
  await createAuditLog({
    entityType: 'facility', entityId: id, action: 'DELETE',
    changedByEmail: user.email, changedByName: user.name || user.email,
    source: SOURCES.UI, summary: `Deleted facility: ${existing.name}`,
    oldData: JSON.stringify(existing),
  });
  return { success: true };
}

export async function getFacilities({ propertyId = null, type = null } = {}) {
  const where = { active: true };
  if (propertyId) where.propertyId = propertyId;
  if (type) where.type = type;
  return await prisma.facility.findMany({ where, orderBy: { name: 'asc' } });
}

export async function getFacility(id) {
  return await prisma.facility.findUnique({ where: { id } });
}

export function getFacilityTypes() {
  return FACILITY_TYPES;
}

export function formatFacilityType(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
