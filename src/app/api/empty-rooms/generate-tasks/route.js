import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { generateEmptyRoomTasks } from '@/services/scheduling';
import { fetchEmptyRooms } from '@/services/cloudbeds';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyName, taskCategory = 'overnight_maintenance', shift = 'overnight' } = body;

    if (!propertyName) {
      return NextResponse.json({ error: 'propertyName is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const emptyRoomsResult = await fetchEmptyRooms(today);

    const user = { email: session.user.email, name: session.user.name };

    const tasks = await generateEmptyRoomTasks(user, {
      emptyRooms: emptyRoomsResult.filter(p => p.propertyName === propertyName),
      taskCategory,
      shift,
    });

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
      message: `Created ${tasks.length} task(s) for ${propertyName}.`,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
