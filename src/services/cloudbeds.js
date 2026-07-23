import { createAuditLog, SOURCES } from './audit';
import { prisma } from '@/lib/prisma';

const CB_BASE = 'https://api.cloudbeds.com/api/v1.3/';

const AZZURRO_CAPACITIES = {
  '311271': 176,
  '311267': 48,
  '311134': 72,
  '311272': 107,
  '311268': 14,
};

const CB_PROPERTIES = [
  { id: '311271', name: 'Darling Harbour', capacity: 176, propertyType: 'hostel' },
  { id: '311267', name: 'Central Sydney', capacity: 48, propertyType: 'hostel' },
  { id: '311134', name: 'Surry Hills', capacity: 72, propertyType: 'hostel' },
  { id: '311272', name: 'Potts Point', capacity: 107, propertyType: 'hostel' },
  { id: '311268', name: 'The Pyrmont Budget Hotel', capacity: 14, propertyType: 'hotel' },
];

function getApiKey(propId) {
  const envKeyMap = {
    '311271': 'CB_KEY_DARLING',
    '311267': 'CB_KEY_CENTRAL',
    '311134': 'CB_KEY_SURRY',
    '311272': 'CB_KEY_POTTS',
    '311268': 'CB_KEY_PYRMONT',
  };
  return process.env[envKeyMap[propId]] || null;
}

const EXCLUDED_STATUSES = new Set(['no_show', 'canceled', 'cancelled']);
const ACTIVE_STATUSES = new Set(['confirmed', 'not_confirmed', 'checked_in']);
const EXPLICIT_PRIVATE_ROOM_TYPE_IDS = new Set([663240, 663243]);

function isExcludedBooking(res) {
  const s = (res.status || '').toLowerCase().replace(/[\s-]/g, '_');
  if (s.includes('cancel')) return true;
  return EXCLUDED_STATUSES.has(s);
}

function isActiveBooking(res) {
  const s = (res.status || '').toLowerCase().replace(/[\s-]/g, '_');
  return ACTIVE_STATUSES.has(s);
}

async function cbFetch(path, params, apiKey, label) {
  const BACKOFF_MS = [0, 1500, 4000];
  const url = new URL(`${CB_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  let lastErr;
  for (let attempt = 0; attempt < BACKOFF_MS.length; attempt++) {
    if (BACKOFF_MS[attempt] > 0) {
      await new Promise(r => setTimeout(r, BACKOFF_MS[attempt]));
    }
    try {
      const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(45000),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
      lastErr = new Error(`status=${resp.status}`);
    } catch (err) {
      lastErr = err;
    }
    if (attempt < BACKOFF_MS.length - 1) {
      console.warn(`[${label}] attempt ${attempt + 1} failed (${lastErr.message}) — retrying`);
    }
  }
  console.error(`[${label}] gave up after ${BACKOFF_MS.length} attempts:`, lastErr?.message);
  return null;
}

async function cbFetchTonightReservations(propId, apiKey, todayStr) {
  const tomorrow = new Date(todayStr + 'T00:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
  const BACKOFF_MS = [0, 1500, 4000];
  const PAGE_SIZES = [100, 50, 50];
  const MAX_ATTEMPTS = BACKOFF_MS.length;

  let all = [], page = 1, fetchFailed = false;
  while (true) {
    let data, lastErr;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      if (BACKOFF_MS[attempt] > 0) await new Promise(r => setTimeout(r, BACKOFF_MS[attempt]));
      try {
        const url = new URL(`${CB_BASE}getReservations`);
        url.searchParams.set('propertyID', propId);
        url.searchParams.set('checkInTo', todayStr);
        url.searchParams.set('checkOutFrom', tomorrowStr);
        url.searchParams.set('pageSize', String(PAGE_SIZES[attempt]));
        url.searchParams.set('pageNumber', String(page));

        const resp = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(45000),
        });
        const d = await resp.json();
        if (resp.ok && d.success) { data = d; break; }
        lastErr = new Error(`bad response status=${resp.status}`);
        data = null;
      } catch (err) {
        lastErr = err;
        data = null;
      }
    }
    if (!data) {
      fetchFailed = true;
      break;
    }
    const items = data.data || [];
    if (!items.length) break;
    all.push(...items);
    if (all.length >= (data.total || 0)) break;
    page++;
  }
  return { reservations: all, fetchFailed };
}

async function cbFetchAllUnassigned(propId, apiKey) {
  let allRooms = [], totalUnassigned = 0, page = 1, fetchFailed = false;
  while (true) {
    const data = await cbFetch('getRoomsUnassigned', { propertyID: propId, pageNumber: page }, apiKey, `Unassigned ${propId} page ${page}`);
    if (!data) { fetchFailed = true; break; }
    const dataList = data.data || [];
    if (!dataList.length || data.count === 0) break;
    if (page === 1) totalUnassigned = data.total || 0;
    allRooms.push(...(dataList[0]?.rooms || []));
    page++;
  }
  return { allRooms, totalUnassigned, fetchFailed };
}

async function cbFetchReservationsSimple(propId, apiKey, checkInFrom, checkInTo) {
  let all = [], page = 1;
  while (true) {
    const data = await cbFetch('getReservations', { propertyID: propId, checkInFrom, checkInTo, pageSize: 100, pageNumber: page }, apiKey, `ReservationsSimple ${propId} page ${page}`);
    if (!data || !data.success) break;
    const items = data.data || [];
    if (!items.length) break;
    all.push(...items);
    if (all.length >= (data.total || 0)) break;
    page++;
  }
  return all;
}

async function cbFetchDetailedReservations(propId, apiKey, resultsFrom, resultsTo) {
  let all = [], page = 1;
  while (true) {
    const data = await cbFetch('getReservationsWithRateDetails', { propertyID: propId, resultsFrom, resultsTo, pageSize: 100, pageNumber: page }, apiKey, `DetailedReservations ${propId} page ${page}`);
    if (!data) break;
    const items = data?.data || [];
    if (!items.length) break;
    all.push(...items);
    if (items.length < 100) break;
    page++;
  }
  return all;
}

async function cbFetchProperty(prop, dateStr) {
  const apiKey = getApiKey(prop.id);
  if (!apiKey) {
    return {
      ...prop,
      dashboard: {},
      allRooms: [],
      totalUnassigned: 0,
      roomsFetchFailed: true,
      reservations: [],
      simpleReservations: [],
      tonightReservations: [],
      tonightFetchFailed: true,
      authFailed: true,
    };
  }

  const todayStr = dateStr;
  const futureDate = new Date(todayStr + 'T00:00:00');
  futureDate.setDate(futureDate.getDate() + 60);
  const futureDateStr = futureDate.toLocaleDateString('en-CA');
  const ext30 = new Date(todayStr + 'T00:00:00');
  ext30.setDate(ext30.getDate() - 30);
  const ext30Str = ext30.toLocaleDateString('en-CA');

  try {
    const [dashData, roomsData, resResp, simpleRes, tonightRes] = await Promise.all([
      cbFetch('getDashboard', { propertyID: prop.id, date: todayStr }, apiKey, `Dashboard ${prop.id}`),
      cbFetchAllUnassigned(prop.id, apiKey),
      cbFetchDetailedReservations(prop.id, apiKey, `${todayStr} 00:00:00`, `${todayStr} 23:59:59`),
      cbFetchReservationsSimple(prop.id, apiKey, ext30Str, futureDateStr),
      cbFetchTonightReservations(prop.id, apiKey, todayStr),
    ]);

    return {
      ...prop,
      dashboard: dashData?.data || {},
      allRooms: roomsData.allRooms,
      totalUnassigned: roomsData.totalUnassigned,
      roomsFetchFailed: roomsData.fetchFailed,
      reservations: resResp || [],
      simpleReservations: simpleRes,
      tonightReservations: tonightRes.reservations,
      tonightFetchFailed: tonightRes.fetchFailed,
      authFailed: false,
    };
  } catch (err) {
    console.error(`[Cloudbeds] Fetch failed for ${prop.name}:`, err.message);
    return {
      ...prop,
      dashboard: {},
      allRooms: [],
      totalUnassigned: 0,
      roomsFetchFailed: true,
      reservations: [],
      simpleReservations: [],
      tonightReservations: [],
      tonightFetchFailed: true,
      authFailed: false,
      fetchError: err.message,
    };
  }
}

function cbProcessProperty(p, dateStr) {
  const roomTypeMap = {}, blockedTypeMap = {};
  const seenIds = new Set();
  let totalBlockedUnique = 0, testRoomsCount = 0, privateRoomsCount = 0;
  const isHotelMode = p.propertyType === 'hotel';

  for (const r of (p.allRooms || [])) {
    const rName = r.roomName || '';
    const rtName = r.roomTypeName || 'Other';
    const rId = r.roomID;
    const isBlocked = r.roomBlocked === true;

    if (!isBlocked && (rName.toUpperCase().includes('TEST') || rtName.toUpperCase().includes('TEST'))) {
      testRoomsCount++;
      continue;
    }
    const rtId = Number(r.roomTypeID);
    const isExplicitPrivate = EXPLICIT_PRIVATE_ROOM_TYPE_IDS.has(rtId);
    if (!isHotelMode && !isBlocked && (isExplicitPrivate || (rtName.toUpperCase().includes('PRIVATE') && !rtName.toUpperCase().includes('DOUBLE')))) {
      privateRoomsCount++;
      continue;
    }
    if (isBlocked && !seenIds.has(rId)) { totalBlockedUnique++; seenIds.add(rId); }
    if (isBlocked) {
      if (!blockedTypeMap[rtName]) blockedTypeMap[rtName] = [];
      blockedTypeMap[rtName].push(rName);
    } else {
      if (!roomTypeMap[rtName]) roomTypeMap[rtName] = [];
      roomTypeMap[rtName].push(rName);
    }
  }

  const bedsVacant = p.roomsFetchFailed
    ? null
    : p.totalUnassigned - totalBlockedUnique - testRoomsCount - privateRoomsCount;

  const tonightActive = (p.tonightReservations || []).filter(r => isActiveBooking(r));
  const occupied = tonightActive.reduce((sum, r) => sum + ((r.rooms || []).length || 1), 0);
  const apiSuspect = p.tonightFetchFailed === true || (occupied === 0 && (bedsVacant ?? 0) < p.capacity);
  const roomsSuspect = p.roomsFetchFailed === true;
  const bedsLeft = Math.max(0, p.capacity - occupied);
  const occupancy = p.capacity > 0 ? (occupied / p.capacity) * 100 : 0;

  const allRooms = [];
  for (const [rtName, rooms] of Object.entries(roomTypeMap)) {
    for (const rName of rooms) {
      allRooms.push({ roomTypeName: rtName, roomName: rName, isBlocked: false, isPrivate: false });
    }
  }
  for (const [rtName, rooms] of Object.entries(blockedTypeMap)) {
    for (const rName of rooms) {
      allRooms.push({ roomTypeName: rtName, roomName: rName, isBlocked: true, isPrivate: false });
    }
  }

  const tonightReservations = (p.tonightReservations || []).filter(r => isActiveBooking(r));
  const emptyRooms = allRooms.filter(r =>
    !r.isBlocked &&
    !tonightReservations.some(tr => (tr.rooms || []).some(trRoom =>
      (trRoom.roomName || '').toUpperCase() === (r.roomName || '').toUpperCase()
    ))
  );

  return {
    id: p.id,
    name: p.name,
    capacity: p.capacity,
    occupancy,
    bedsLeft,
    bedsVacant,
    apiSuspect,
    roomsSuspect,
    authFailed: p.authFailed || false,
    fetchError: p.fetchError || null,
    availableRoomTypes: Object.fromEntries(Object.entries(roomTypeMap).map(([k, v]) => [k, v.length])),
    availableRoomDetails: roomTypeMap,
    emptyRooms,
    tonightReservations,
    occupiedBeds: occupied,
    blockedRoomsCount: totalBlockedUnique,
    testRoomsCount,
    privateRoomsCount,
  };
}

export async function fetchOccupancyData(dateStr) {
  const results = [];
  for (const prop of CB_PROPERTIES) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const fetched = await cbFetchProperty(prop, dateStr);
      const processed = cbProcessProperty(fetched, dateStr);
      results.push(processed);
    } catch (err) {
      console.error(`[Cloudbeds] Error processing ${prop.name}:`, err.message);
      results.push({
        id: prop.id, name: prop.name, capacity: prop.capacity,
        occupancy: 0, bedsLeft: 0, bedsVacant: null,
        apiSuspect: true, roomsSuspect: true, authFailed: false,
        fetchError: err.message, emptyRooms: [], tonightReservations: [],
        occupiedBeds: 0, blockedRoomsCount: 0, testRoomsCount: 0, privateRoomsCount: 0,
        availableRoomTypes: {}, availableRoomDetails: {},
      });
    }
  }
  return results;
}

export async function fetchEmptyRooms(dateStr) {
  const occupancyData = await fetchOccupancyData(dateStr);
  return occupancyData.map(p => ({
    propertyId: p.id,
    propertyName: p.name,
    capacity: p.capacity,
    occupiedBeds: p.occupiedBeds,
    bedsLeft: p.bedsLeft,
    occupancy: p.occupancy,
    apiSuspect: p.apiSuspect,
    roomsSuspect: p.roomsSuspect,
    authFailed: p.authFailed,
    fetchError: p.fetchError,
    emptyRooms: p.emptyRooms.map(r => ({
      roomName: r.roomName,
      roomTypeName: r.roomTypeName,
    })),
    availableRoomTypes: p.availableRoomTypes,
  }));
}

export { CB_PROPERTIES, getApiKey };
