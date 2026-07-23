import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { generateDailyAutomatedTasks, generateBathroomDeepCleanTasks, generateVentCleaningTasks } from '@/services/scheduling';
import { prisma } from '@/lib/prisma';

async function generateForAll(user, dateStr, mode) {
  const properties = await prisma.property.findMany({ where: { active: true } });
  const results = [];
  for (const prop of properties) {
    if (mode === 'all' || mode === 'bathroom_deep_clean') {
      try {
        const bathTasks = await generateBathroomDeepCleanTasks(user, { propertyCode: prop.code, dateStr, bathroomsPerCleaner: 1 });
        results.push({ property: prop.name, type: 'bathroom_deep_clean', count: bathTasks.length });
      } catch (e) { results.push({ property: prop.name, type: 'bathroom_deep_clean', count: 0, error: e.message }); }
    }
    if (mode === 'all' || mode === 'vent_cleaning') {
      try {
        const dayOfWeek = (dateStr ? new Date(dateStr) : new Date()).getDay();
        if (mode === 'all' && dayOfWeek !== 1 && dayOfWeek !== 4) continue;
        const ventTasks = await generateVentCleaningTasks(user, { propertyCode: prop.code, bathroomsPerSession: 4 });
        results.push({ property: prop.name, type: 'vent_cleaning', count: ventTasks.length });
      } catch (e) { results.push({ property: prop.name, type: 'vent_cleaning', count: 0, error: e.message }); }
    }
    if (mode === 'all' || mode === 'daily') {
      try {
        const dailyTasks = await generateDailyAutomatedTasks(user, prop.code);
        results.push({ property: prop.name, type: 'daily', count: dailyTasks.length });
      } catch (e) { results.push({ property: prop.name, type: 'daily', count: 0, error: e.message }); }
    }
  }
  return results;
}

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

    if (propertyCode) {
      if (mode === 'bathroom_deep_clean' || mode === 'all') {
        const tasks = await generateBathroomDeepCleanTasks(user, { propertyCode, dateStr, bathroomsPerCleaner: 1 });
        results.push({ type: 'bathroom_deep_clean', count: tasks.length });
      }
      if (mode === 'vent_cleaning' || mode === 'all') {
        const tasks = await generateVentCleaningTasks(user, { propertyCode, bathroomsPerSession: 4 });
        results.push({ type: 'vent_cleaning', count: tasks.length });
      }
      if (mode === 'daily' || mode === 'all') {
        const tasks = await generateDailyAutomatedTasks(user, propertyCode);
        results.push({ type: 'daily', count: tasks.length });
      }
    } else {
      results = await generateForAll(user, dateStr, mode);
    }

    if (results.length === 0) {
      results.push({ type: mode, count: 0, note: 'No facilities or properties found for this mode' });
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
