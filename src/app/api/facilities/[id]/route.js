import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getFacility, updateFacility, deleteFacility } from '@/services/facilities';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const facility = await getFacility(id);
    if (!facility) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(facility);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const facility = await updateFacility(id, body, { email: session.user.email, name: session.user.name });
    if (!facility) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(facility);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const result = await deleteFacility(id, { email: session.user.email, name: session.user.name });
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
