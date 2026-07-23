import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyCode = searchParams.get('propertyCode');
    const bathroomType = searchParams.get('bathroomType');
    const verificationStatus = searchParams.get('verificationStatus');

    const where = { type: 'bathroom' };
    if (propertyCode) where.propertyCode = propertyCode;
    if (bathroomType) where.bathroomType = bathroomType;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const bathrooms = await prisma.facility.findMany({
      where,
      orderBy: [{ propertyCode: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(bathrooms);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
