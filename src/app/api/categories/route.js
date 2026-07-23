import { NextResponse } from 'next/server';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/services/categories';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { key, label, icon } = body;
    if (!key || !label) {
      return NextResponse.json({ error: 'key and label are required' }, { status: 400 });
    }
    const cat = await addCategory({ key, label, icon });
    return NextResponse.json(cat, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { key, label, icon, sortOrder } = body;
    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }
    const cat = await updateCategory(key, { label, icon, sortOrder });
    return NextResponse.json(cat);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { key } = body;
    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }
    const result = await deleteCategory(key);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
