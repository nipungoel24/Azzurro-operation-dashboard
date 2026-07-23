import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyCode = searchParams.get('propertyCode');
    const propertyId = searchParams.get('propertyId');
    const verificationStatus = searchParams.get('verificationStatus');

    const where = {};
    if (propertyCode) where.propertyCode = propertyCode;
    if (propertyId) where.propertyId = propertyId;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const rooms = await prisma.room.findMany({
      where,
      orderBy: [{ propertyCode: 'asc' }, { roomNumber: 'asc' }],
    });

    return NextResponse.json(rooms);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
