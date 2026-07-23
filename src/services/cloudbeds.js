import { createAuditLog, SOURCES } from './audit';
import { prisma } from '@/lib/prisma';

const CB_BASE = 'https://api.cloudbeds.com/api/v1.3/';
const CACHE_TTL_MS = 5 * 60 * 1000;

const roomCache = {
  data: null,
  timestamp: 0,
};

export function getCachedEmptyRooms() {
  if (roomCache.data && (Date.now() - roomCache.timestamp) < CACHE_TTL_MS) {
    return { data: roomCache.data, cached: true, age: Date.now() - roomCache.timestamp };
  }
  return null;
}

export function invalidateRoomCache() {
  roomCache.data = null;
  roomCache.timestamp = 0;
}

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

const CB_ENV_KEY_MAP = {
  '311271': 'CB_KEY_DARLING',
  '311267': 'CB_KEY_CENTRAL',
  '311134': 'CB_KEY_SURRY',
  '311272': 'CB_KEY_POTTS',
  '311268': 'CB_KEY_PYRMONT',
};

function getApiKey(propId) {
  return process.env[CB_ENV_KEY_MAP[propId]] || null;
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
  const BACKOFF_MS = [0, 2000, 5000];
  const url = new URL(`${CB_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  let lastErr;
  let lastStatus = 0;
  for (let attempt = 0; attempt < BACKOFF_MS.length; attempt++) {
    if (BACKOFF_MS[attempt] > 0) {
      await new Promise(r => setTimeout(r, BACKOFF_MS[attempt]));
    }
    try {
      const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(45000),
      });
      lastStatus = resp.status;
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
      if (resp.status === 401 || resp.status === 403) {
        console.error(`[${label}] Auth failed (${resp.status}) — API key may be expired or revoked`);
        return null;
      }
      lastErr = new Error(`status=${resp.status}`);
    } catch (err) {
      lastErr = err;
      lastStatus = 0;
    }
    if (attempt < BACKOFF_MS.length - 1) {
      console.warn(`[${label}] attempt ${attempt + 1} failed (${lastErr?.message}) — retrying`);
    }
  }
  console.error(`[${label}] gave up after ${BACKOFF_MS.length} attempts, last status=${lastStatus}: ${lastErr?.message}`);
  return null;
}

async function cbFetchTonightReservations(propId, apiKey, todayStr) {
  const tomorrow = new Date(todayStr + 'T00:00:00');
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
  const BACKOFF_MS = [0, 2000, 5000];
  const PAGE_SIZES = [100, 100, 50];
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
  let allRooms = [], totalUnassigned = 0, page = 1, fetchFailed = false, errorDetail = null;
  const MAX_PAGES = 20;
  while (page <= MAX_PAGES) {
    const data = await cbFetch('getRoomsUnassigned', { propertyID: propId, pageNumber: page }, apiKey, `Unassigned ${propId} page ${page}`);
    if (!data) { fetchFailed = true; errorDetail = 'API returned null/empty response'; break; }

    let dataList = [];
    if (Array.isArray(data.data)) {
      dataList = data.data;
    } else if (data.data && typeof data.data === 'object' && Array.isArray(data.data.rooms)) {
      dataList = [{ rooms: data.data.rooms, roomTypeName: data.data.roomTypeName, roomTypeID: data.data.roomTypeID }];
    } else if (data.data && typeof data.data === 'object' && data.data.roomName) {
      dataList = [{ rooms: [data.data] }];
    }

    const total = typeof data.total === 'number' ? data.total : (typeof data.count === 'number' ? data.count : allRooms.length);

    if (page === 1) totalUnassigned = total;

    if (!dataList.length) {
      if (total > 0 && page === 1) {
        errorDetail = `API total=${total} but page 1 returned no items — check property setup in Cloudbeds`;
        fetchFailed = true;
      }
      break;
    }

    const newRooms = dataList.flatMap(item => {
      const rooms = Array.isArray(item.rooms) ? item.rooms : (item.roomName ? [item] : []);
      return rooms.map(r => ({
        ...r,
        roomTypeName: item.roomTypeName || r.roomTypeName || 'Unknown',
        roomTypeID: item.roomTypeID || r.roomTypeID || null,
      }));
    });

    if (!newRooms.length) break;
    allRooms.push(...newRooms);

    if (total > 0 && allRooms.length >= total) break;
    page++;
  }
  if (page > MAX_PAGES) {
    errorDetail = `Exceeded max pages (${MAX_PAGES}) — possible API issue`;
  }
  return { allRooms, totalUnassigned, fetchFailed, errorDetail };
}

async function cbFetchAllRooms(propId, apiKey) {
  let allRooms = [], page = 1, fetchFailed = false;
  const MAX_PAGES = 10;
  while (page <= MAX_PAGES) {
    const data = await cbFetch('getRooms', { propertyID: propId, pageNumber: page, pageSize: 100 }, apiKey, `Rooms ${propId} page ${page}`);
    if (!data) { fetchFailed = true; break; }

    const dataList = Array.isArray(data.data) ? data.data : [];
    if (!dataList.length) break;

    allRooms.push(...dataList.map(r => ({
      ...r,
      roomTypeName: r.roomTypeName || r.roomTypeName || 'Unknown',
      roomTypeID: r.roomTypeID || null,
      roomBlocked: r.roomBlocked || false,
    })));

    if (dataList.length < 100) break;
    page++;
  }
  return { allRooms, fetchFailed };
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
      dashboardRaw: null,
      allRooms: [],
      totalUnassigned: 0,
      roomsFetchFailed: true,
      roomsErrorDetail: `No API key configured for property ${prop.name} (${prop.id}). Set ${CB_ENV_KEY_MAP[prop.id] || 'API key'} in environment.`,
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

    let allRoomsData = roomsData;
    if (prop.propertyType === 'hotel' && (roomsData.fetchFailed || allRoomsData.allRooms.length === 0)) {
      const hotelRooms = await cbFetchAllRooms(prop.id, apiKey);
      if (hotelRooms.allRooms.length > 0) {
        allRoomsData = {
          allRooms: hotelRooms.allRooms,
          totalUnassigned: hotelRooms.allRooms.length,
          fetchFailed: hotelRooms.fetchFailed,
          errorDetail: null,
        };
      }
    }

    const allRequestsNull = !dashData && allRoomsData.allRooms.length === 0 && resResp.length === 0 && simpleRes.length === 0 && tonightRes.reservations.length === 0;
    const authFailed = allRequestsNull && allRoomsData.fetchFailed;

    return {
      ...prop,
      dashboard: dashData?.data || {},
      dashboardRaw: dashData || null,
      allRooms: allRoomsData.allRooms,
      totalUnassigned: allRoomsData.totalUnassigned,
      roomsFetchFailed: allRoomsData.fetchFailed,
      roomsErrorDetail: allRoomsData.errorDetail || (allRequestsNull ? `All API endpoints returned empty — check API key for property ${prop.name}` : null),
      reservations: resResp || [],
      simpleReservations: simpleRes,
      tonightReservations: tonightRes.reservations,
      tonightFetchFailed: tonightRes.fetchFailed,
      authFailed: authFailed,
    };
  } catch (err) {
    console.error(`[Cloudbeds] Fetch failed for ${prop.name}:`, err.message);
    return {
      ...prop,
      dashboard: {},
      dashboardRaw: null,
      allRooms: [],
      totalUnassigned: 0,
      roomsFetchFailed: true,
      roomsErrorDetail: `Unexpected error: ${err.message}`,
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
    propertyType: p.propertyType || 'hostel',
    occupancy,
    bedsLeft,
    bedsVacant,
    apiSuspect,
    roomsSuspect,
    authFailed: p.authFailed || false,
    fetchError: p.fetchError || p.roomsErrorDetail || null,
    emptyRooms,
    tonightReservations,
    occupiedBeds: occupied,
    blockedRoomsCount: totalBlockedUnique,
    testRoomsCount,
    privateRoomsCount,
    availableRoomTypes: Object.fromEntries(Object.entries(roomTypeMap).map(([k, v]) => [k, v.length])),
    availableRoomDetails: roomTypeMap,
    dashboardRaw: p.dashboardRaw || null,
  };
}

export async function fetchOccupancyData(dateStr) {
  const results = [];
  for (const prop of CB_PROPERTIES) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const fetched = await Promise.race([
        cbFetchProperty(prop, dateStr),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 60000)),
      ]);
      const processed = cbProcessProperty(fetched, dateStr);
      results.push(processed);
    } catch (err) {
      console.error(`[Cloudbeds] Error processing ${prop.name}:`, err.message);
      results.push({
        id: prop.id, name: prop.name, capacity: prop.capacity,
        occupancy: 0, bedsLeft: 0, bedsVacant: null,
        apiSuspect: true, roomsSuspect: true, authFailed: false,
        fetchError: `Request timeout or error: ${err.message}`, emptyRooms: [], tonightReservations: [],
        occupiedBeds: 0, blockedRoomsCount: 0, testRoomsCount: 0, privateRoomsCount: 0,
        availableRoomTypes: {}, availableRoomDetails: {},
      });
    }
  }
  return results;
}

export async function fetchEmptyRooms(dateStr, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedEmptyRooms();
    if (cached) return cached.data;
  }

  const occupancyData = await fetchOccupancyData(dateStr);
  const result = occupancyData.map(p => ({
    propertyId: p.id,
    propertyName: p.name,
    capacity: p.capacity,
    propertyType: p.propertyType || 'hostel',
    occupiedBeds: p.occupiedBeds,
    bedsLeft: p.bedsLeft,
    occupancy: p.occupancy,
    apiSuspect: p.apiSuspect,
    roomsSuspect: p.roomsSuspect,
    authFailed: p.authFailed,
    fetchError: p.fetchError || null,
    emptyRooms: p.emptyRooms.map(r => ({
      roomName: r.roomName,
      roomTypeName: r.roomTypeName,
    })),
    availableRoomTypes: p.availableRoomTypes,
    dashboardRaw: p.dashboardRaw || null,
  }));

  roomCache.data = result;
  roomCache.timestamp = Date.now();
  return result;
}

export { CB_PROPERTIES, CB_ENV_KEY_MAP, getApiKey };
