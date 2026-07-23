import { NextResponse } from 'next/server';
import { fetchEmptyRooms, getCachedEmptyRooms } from '@/services/cloudbeds';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyName = searchParams.get('propertyName');
    const forceRefresh = searchParams.get('refresh') === 'true';
    const today = new Date().toISOString().split('T')[0];

    if (!forceRefresh) {
      const cached = getCachedEmptyRooms();
      if (cached) {
        let data = cached.data;
        if (propertyName && propertyName !== 'All') {
          data = data.filter(p => p.propertyName === propertyName);
        }
        return NextResponse.json(data, {
          headers: { 'X-Cache': 'HIT', 'X-Cache-Age': String(cached.age || 0) },
        });
      }
    }

    const data = await fetchEmptyRooms(today, forceRefresh);

    if (propertyName && propertyName !== 'All') {
      return NextResponse.json(data.filter(p => p.propertyName === propertyName));
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
