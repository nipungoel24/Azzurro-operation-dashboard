export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getProperties, seedDefaultProperties } from '@/services/facilities';

export async function GET() {
  try {
    await seedDefaultProperties();
    const properties = await getProperties();
    return NextResponse.json(properties);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
