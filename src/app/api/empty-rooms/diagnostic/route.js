import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { CB_PROPERTIES, CB_ENV_KEY_MAP, getApiKey } from '@/services/cloudbeds';

const CB_BASE = 'https://api.cloudbeds.com/api/v1.3/';

async function testEndpoint(propId, apiKey, endpoint, params, label) {
  const url = new URL(`${CB_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  try {
    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(30000),
    });
    const body = await resp.json().catch(() => resp.statusText);
    return {
      endpoint: label,
      status: resp.status,
      ok: resp.ok,
      data: resp.ok ? body : { error: body, status: resp.status },
    };
  } catch (err) {
    return { endpoint: label, status: 0, ok: false, data: { error: err.message } };
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyFilter = searchParams.get('property') || null;

    const today = new Date().toISOString().split('T')[0];
    const results = [];

    for (const prop of CB_PROPERTIES) {
      if (propertyFilter && prop.name !== propertyFilter) continue;

      const apiKey = getApiKey(prop.id);
      if (!apiKey) {
        results.push({
          name: prop.name,
          id: prop.id,
          propertyType: prop.propertyType,
          envKey: CB_ENV_KEY_MAP[prop.id],
          keyConfigured: false,
          message: `No API key set. Set ${CB_ENV_KEY_MAP[prop.id]} in environment.`,
          tests: [],
        });
        continue;
      }

      const tests = await Promise.all([
        testEndpoint(prop.id, apiKey, 'getDashboard', { propertyID: prop.id, date: today }, 'getDashboard'),
        testEndpoint(prop.id, apiKey, 'getRoomsUnassigned', { propertyID: prop.id, pageNumber: 1 }, 'getRoomsUnassigned'),
        testEndpoint(prop.id, apiKey, 'getReservations', { propertyID: prop.id, pageSize: 5, pageNumber: 1 }, 'getReservations'),
      ]);

      const allFailed = tests.every(t => !t.ok);

      results.push({
        name: prop.name,
        id: prop.id,
        propertyType: prop.propertyType,
        envKey: CB_ENV_KEY_MAP[prop.id],
        keyConfigured: true,
        allEndpointsFailed: allFailed,
        message: allFailed ? 'All endpoints failed — API key may be invalid or expired' : 'Connected',
        tests,
      });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
