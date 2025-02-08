import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');
  
  return NextResponse.json({ 
    authenticated: accessToken !== undefined 
  });
} 