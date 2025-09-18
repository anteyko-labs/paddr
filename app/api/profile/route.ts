export const dynamic = 'force-dynamic';
// import { supabase } from '@/lib/supabase'; // Временно отключено
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('PROFILE API POST CALLED, body:', body);
    // Временно отключено Supabase
    return NextResponse.json({ success: true, message: 'Supabase temporarily disabled' });
  } catch (e) {
    console.error('API route error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    console.log('PROFILE API GET CALLED, address:', address);
    if (!address) return NextResponse.json({ error: 'No address' }, { status: 400 });
    // Временно отключено Supabase
    return NextResponse.json({ message: 'Supabase temporarily disabled' });
  } catch (e) {
    console.error('API route GET error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
} 