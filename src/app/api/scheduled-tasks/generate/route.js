import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { generateDailyAutomatedTasks, generateBathroomDeepCleanTasks, generateVentCleaningTasks } from '@/services/scheduling';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dateStr, propertyCode, mode = 'all' } = body;
    const user = { email: session.user.email, name: session.user.name };

    let results = [];

    if (mode === 'bathroom_deep_clean' && propertyCode) {
      const tasks = await generateBathroomDeepCleanTasks(user, { propertyCode, dateStr });
      results.push({ type: 'bathroom_deep_clean', count: tasks.length, tasks });
    } else if (mode === 'vent_cleaning' && propertyCode) {
      const tasks = await generateVentCleaningTasks(user, { propertyCode, bathroomsPerSession: 4 });
      results.push({ type: 'vent_cleaning', count: tasks.length, tasks });
    } else if (mode === 'daily' && propertyCode) {
      const tasks = await generateDailyAutomatedTasks(user, propertyCode);
      results.push({ type: 'daily', count: tasks.length, tasks });
    } else if (mode === 'all') {
      const properties = await prisma.property.findMany({ where: { active: true } });
      for (const prop of properties) {
        const bathTasks = await generateBathroomDeepCleanTasks(user, { propertyCode: prop.code, dateStr, bathroomsPerCleaner: 1 });
        results.push({ property: prop.name, type: 'bathroom_deep_clean', count: bathTasks.length, tasks: bathTasks });

        const today = dateStr ? new Date(dateStr) : new Date();
        const dayOfWeek = today.getDay();
        if (dayOfWeek === 1 || dayOfWeek === 4) {
          const ventTasks = await generateVentCleaningTasks(user, { propertyCode: prop.code, bathroomsPerSession: 4 });
          results.push({ property: prop.name, type: 'vent_cleaning', count: ventTasks.length, tasks: ventTasks });
        }

        const dailyTasks = await generateDailyAutomatedTasks(user, prop.code);
        results.push({ property: prop.name, type: 'daily', count: dailyTasks.length, tasks: dailyTasks });
      }
    } else {
      return NextResponse.json({ error: `Unknown mode: ${mode}` }, { status: 400 });
    }

    const totalTasks = results.reduce((sum, r) => sum + (r.count || 0), 0);

    return NextResponse.json({
      success: true,
      date: dateStr || new Date().toISOString().split('T')[0],
      totalTasks,
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
