import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchEmptyRooms, invalidateRoomCache } from '@/services/cloudbeds';
import { prisma } from '@/lib/prisma';
import { createAuditLog, SOURCES } from '@/services/audit';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    invalidateRoomCache();

    const syncRun = await prisma.cloudbedsSyncRun.create({
      data: {
        status: 'running',
        propertyName: 'All',
      },
    });

    try {
      const data = await fetchEmptyRooms(today, true);
      let totalRooms = 0;
      let totalUpdated = 0;

      for (const prop of data) {
        totalRooms += prop.emptyRooms.length;
        for (const room of prop.emptyRooms) {
          const existing = await prisma.emptyRoomSnapshot.findFirst({
            where: {
              propertyName: prop.propertyName,
              roomNumber: room.roomName,
              syncedAt: {
                gte: new Date(today + 'T00:00:00'),
              },
            },
          });

          if (!existing) {
            await prisma.emptyRoomSnapshot.create({
              data: {
                propertyId: prop.propertyId,
                propertyName: prop.propertyName,
                roomNumber: room.roomName,
                roomType: room.roomTypeName,
                occupancyStatus: 'empty',
                dataSource: 'cloudbeds',
                syncRunId: syncRun.id,
                syncedAt: new Date(),
              },
            });
            totalUpdated++;
          }
        }
      }

      await prisma.cloudbedsSyncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'completed',
          roomsFound: totalRooms,
          roomsUpdated: totalUpdated,
          completedAt: new Date(),
        },
      });

      await createAuditLog({
        entityType: 'cloudbeds_sync',
        entityId: syncRun.id,
        action: 'SYNC_COMPLETED',
        changedByEmail: session.user.email,
        changedByName: session.user.name || session.user.email,
        source: SOURCES.CLOUDBEDS_SYNC,
        summary: `Cloudbeds sync: ${totalUpdated} rooms updated, ${totalRooms} total`,
      });

      return NextResponse.json({
        success: true,
        syncRunId: syncRun.id,
        roomsFound: totalRooms,
        roomsUpdated: totalUpdated,
        data,
      });
    } catch (syncError) {
      await prisma.cloudbedsSyncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'failed',
          errors: syncError.message,
          completedAt: new Date(),
        },
      });
      throw syncError;
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
