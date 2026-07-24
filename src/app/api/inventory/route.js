export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyCode = searchParams.get('propertyCode');
    const verificationStatus = searchParams.get('verificationStatus');

    const where = {};
    if (propertyCode) where.propertyCode = propertyCode;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const properties = await prisma.property.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Enrich with computed counts
    const enriched = await Promise.all(properties.map(async (p) => {
      const roomCount = await prisma.room.count({ where: { propertyId: p.id } });
      const bedSum = await prisma.room.aggregate({
        where: { propertyId: p.id },
        _sum: { bedCount: true },
      });
      const bathroomCount = await prisma.facility.count({
        where: { propertyId: p.id, type: 'bathroom' },
      });

      return {
        ...p,
        computedRooms: roomCount,
        computedBeds: bedSum._sum.bedCount || 0,
        computedBathrooms: bathroomCount,
      };
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
