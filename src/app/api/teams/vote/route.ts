import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, direction } = body; // direction: 'up' or 'down'

    if (!teamId) {
      return NextResponse.json({ error: 'Missing teamId' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current score
    const { data: team, error: fetchErr } = await supabase
      .from('teams')
      .select('score')
      .eq('id', teamId)
      .single();

    if (fetchErr || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const currentScore = (team as any).score || 0;
    const newScore = direction === 'down'
      ? Math.max(0, currentScore - 1)
      : currentScore + 1;

    // Update score
    const { error: updateErr } = await supabase
      .from('teams')
      .update({ score: newScore })
      .eq('id', teamId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update score', details: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ teamId, score: newScore });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
