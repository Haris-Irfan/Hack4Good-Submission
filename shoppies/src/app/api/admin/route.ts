// pages/api/admin.js
import * as admin from 'firebase-admin';
import { NextResponse } from 'next/server';

var serviceAccount = require("../../../hack4good-f1ff4-firebase-adminsdk-pvntr-4a365a070b.json")

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const auth = admin.auth();

export async function POST(req: Request) {
  try {
    const { action, user_email, password } = await req.json();

    if (action === 'createUser' && user_email && password) {
      // Create new user
      await auth.createUser({
        email: user_email,
        password: password,
      });
      return NextResponse.json({ message: 'User created successfully' }, { status: 200 });
    }

    if (action === 'updatePassword' && user_email && password) {
      // Update user password
      const user = await auth.getUserByEmail(user_email);
      if (user) {
        await auth.updateUser(user.uid, { password: password });
        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
      }
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (action === 'suspendUser' && user_email) {
      // Suspend user
      const user = await auth.getUserByEmail(user_email);
      if (user) {
        await auth.updateUser(user.uid, { disabled: true });
        return NextResponse.json({ message: 'User suspended successfully' }, { status: 200 });
      }
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (action === 'reenableUser' && user_email) {
      // Re-enable user
      const user = await auth.getUserByEmail(user_email);
      if (user) {
        await auth.updateUser(user.uid, { disabled: false });
        return NextResponse.json({ message: 'User re-enabled successfully' }, { status: 200 });
      }
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (action === 'isUserSuspended' && user_email) {
      // Get user account status
      const user = await auth.getUserByEmail(user_email)
      if (user) {
        return NextResponse.json({ message: user.disabled }, { status: 200 });
      }
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error with Firebase Admin operation:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}