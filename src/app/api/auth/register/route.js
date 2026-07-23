import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email format is correct
    if (!email.includes('@')) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // Check if password length is at least 6 characters
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email address already exists" }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "User registered successfully", 
      userId: newUser.id 
    }, { status: 201 });

  } catch (err) {
    console.error('[POST /api/auth/register] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
