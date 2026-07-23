import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { fetchEmptyRooms } from '@/services/cloudbeds';
import { prisma } from '@/lib/prisma';
import { createAuditLog, SOURCES } from '@/services/audit';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyName = searchParams.get('propertyName');
    const today = new Date().toISOString().split('T')[0];

    const data = await fetchEmptyRooms(today);

    if (propertyName && propertyName !== 'All') {
      return NextResponse.json(data.filter(p => p.propertyName === propertyName));
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
