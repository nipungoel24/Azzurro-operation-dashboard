import { useState, useEffect, useRef, useCallback } from 'react';

const MOCK_OCCUPANCY_DATA = {
  date: "Jul 10, 02:15 PM",
  dateStr: "2026-07-10",
  timestamp: 1689000900000,
  avgOccupancy: 62.3,
  totalBedsLeft: 287,
  properties: [
    {
      id: "311271",
      name: "Darling Harbour",
      capacity: 176,
      occupancy: 68.75,
      bedsLeft: 55,
      bedsVacant: 53, // Blocked = 2 (bedsLeft - bedsVacant)
      visits: 234,
      apiSuspect: false,
      availableRoomTypes: {
        "4-Bed Mixed": 3,
        "6-Bed Female": 2,
        "8-Bed Male": 1
      },
      sourceCounts: { BDC: 2, Website: 8, Expedia: 1, 'Walk-In': 0, Ctrip: 0, Hostelworld: 1, Other: 0 },
      bedCounts: { BDC: 2, Website: 5, Expedia: 1, 'Walk-In': 0, Ctrip: 0, Hostelworld: 1, Other: 0 },
      roomCounts: { BDC: 0, Website: 3, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 0, Other: 0 },
      websiteRev: 1250.50,
      extensionsCount: 2,
      walkInCount: 0,
      totalBookingsToday: 12,
      privateRoomsList: [
        { room: "Room 21", type: "Private Single", checkIn: "2026-07-10", checkOut: "2026-07-12", guest: "John Doe", total: 180.00, dateCreated: "2026-07-10" }
      ]
    },
    {
      id: "311267",
      name: "Central Sydney",
      capacity: 48,
      occupancy: 79.16, // Amber
      bedsLeft: 10,
      bedsVacant: 8, // Blocked = 2
      visits: 89,
      apiSuspect: false,
      availableRoomTypes: { "Double Room": 1, "Twin Private": 1 },
      sourceCounts: { BDC: 4, Website: 12, Expedia: 2, 'Walk-In': 0, Ctrip: 0, Hostelworld: 2, Other: 0 },
      bedCounts: { BDC: 4, Website: 9, Expedia: 2, 'Walk-In': 0, Ctrip: 0, Hostelworld: 2, Other: 0 },
      roomCounts: { BDC: 0, Website: 3, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 0, Other: 0 },
      websiteRev: 890.00,
      extensionsCount: 1,
      walkInCount: 0,
      totalBookingsToday: 8,
      privateRoomsList: []
    },
    {
      id: "311134",
      name: "Surry Hills",
      capacity: 72,
      occupancy: 94.44, // Red
      bedsLeft: 4,
      bedsVacant: 4, // Blocked = 0
      visits: 120,
      apiSuspect: false,
      availableRoomTypes: {},
      sourceCounts: { BDC: 3, Website: 15, Expedia: 1, 'Walk-In': 1, Ctrip: 0, Hostelworld: 3, Other: 0 },
      bedCounts: { BDC: 3, Website: 12, Expedia: 1, 'Walk-In': 1, Ctrip: 0, Hostelworld: 3, Other: 0 },
      roomCounts: { BDC: 0, Website: 2, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 0, Other: 0 },
      websiteRev: 1420.00,
      extensionsCount: 3,
      walkInCount: 1,
      totalBookingsToday: 18,
      privateRoomsList: []
    },
    {
      id: "311272",
      name: "Potts Point",
      capacity: 107,
      occupancy: 51.40, // Green
      bedsLeft: 52,
      bedsVacant: 48, // Blocked = 4
      visits: 180,
      apiSuspect: true, // API ALERT
      availableRoomTypes: { "Standard Single": 5, "Queen Private": 2 },
      sourceCounts: { BDC: 1, Website: 6, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 1, Other: 0 },
      bedCounts: { BDC: 1, Website: 4, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 1, Other: 0 },
      roomCounts: { BDC: 0, Website: 2, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 0, Other: 0 },
      websiteRev: 610.50,
      extensionsCount: 0,
      walkInCount: 0,
      totalBookingsToday: 5,
      privateRoomsList: []
    },
    {
      id: "311268",
      name: "The Pyrmont Budget Hotel",
      capacity: 14,
      occupancy: 57.14, // Green
      bedsLeft: 6,
      bedsVacant: 6, // Blocked = 0
      visits: 45,
      apiSuspect: false,
      availableRoomTypes: { "Deluxe Double": 2 },
      sourceCounts: { BDC: 2, Website: 4, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 0, Other: 0 },
      bedCounts: { BDC: 2, Website: 3, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 0, Other: 0 },
      roomCounts: { BDC: 0, Website: 1, Expedia: 0, 'Walk-In': 0, Ctrip: 0, Hostelworld: 0, Other: 0 },
      websiteRev: 340.00,
      extensionsCount: 0,
      walkInCount: 0,
      totalBookingsToday: 3,
      privateRoomsList: []
    }
  ],
  summary: {
    sources: [
      { name: "BDC", count: 12, beds: 10, rooms: 2 },
      { name: "Website", count: 43, beds: 33, rooms: 10 },
      { name: "Expedia", count: 4, beds: 4, rooms: 0 },
      { name: "Hostelworld", count: 7, beds: 7, rooms: 0 },
      { name: "Walk-In", count: 1, beds: 1, rooms: 0 }
    ],
    totalReservations: 67,
    totalBeds: 55,
    totalRooms: 12,
    websiteRevenue: 4511.00,
    extensions: { count: 6, revenue: 1250.50 },
    organic: { count: 61, revenue: 3260.50 },
    walkIns: 1,
    totalBookingsToday: 46
  },
  deltas: {
    fromDate: "Jul 10, 01:15 PM",
    toDate: "Jul 10, 02:15 PM",
    sameDay: true,
    avgOccupancy: 2.5,
    totalBedsLeft: -12,
    totalReservations: 3,
    websiteRevenue: 450.00,
    websiteVisits: 23,
    organic: 2,
    extensions: 0,
    walkIns: 0,
    totalBookings: 3,
    privateRooms: 0,
    pyrmontCount: 0,
    sources: { BDC: 0, Website: 2, Expedia: 1 },
    properties: {
      "Darling Harbour": { occupancy: 1.25, bedsLeft: -3 },
      "Central Sydney": { occupancy: 0.5, bedsLeft: -1 }
    }
  },
  previousDate: "Jul 10, 01:15 PM"
};

export function useOccupancyData(pollIntervalMs = 300000) {
  const [data, setData] = useState(MOCK_OCCUPANCY_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const res = await fetch('/api/occupancy', {
        signal: abortControllerRef.current.signal,
      });
      if (!res.ok) {
        throw new Error(`Occupancy API returned status ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn("Failed to fetch live occupancy, falling back to mock data:", err.message);
      setError(err.message);
      // Fallback is already stored in state, so we keep using MOCK_OCCUPANCY_DATA
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollIntervalMs);
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, pollIntervalMs]);

  return { data, loading, error, refetch: fetchData };
}
