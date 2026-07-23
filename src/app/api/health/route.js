import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: 'unknown',
    auth: 'unknown',
    propertyCount: 0,
    userCount: 0,
    version: process.env.npm_package_version || 'unknown',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = 'connected';
  } catch (err) {
    checks.db = `error: ${err.message}`;
    checks.status = 'degraded';
    return NextResponse.json(checks, { status: 503 });
  }

  try {
    checks.propertyCount = await prisma.property.count();
    checks.userCount = await prisma.user.count();
  } catch (err) {
    checks.status = 'degraded';
  }

  checks.auth = process.env.NEXTAUTH_SECRET ? 'configured' : 'missing NEXTAUTH_SECRET';
  checks.nexAuthUrl = process.env.NEXTAUTH_URL || 'not set';

  return NextResponse.json(checks);
}
