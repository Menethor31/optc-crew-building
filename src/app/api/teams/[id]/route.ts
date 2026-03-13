import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// DELETE a team and its related data
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const teamId = params.id;
  if (!teamId) {
    return NextResponse.json({ error: 'Missing team ID' }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete guides first (foreign key)
    await supabase.from('team_guides').delete().eq('team_id', teamId);
    // Delete units
    await supabase.from('team_units').delete().eq('team_id', teamId);
    // Delete team
    const { error } = await supabase.from('teams').delete().eq('id', teamId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete team', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, teamId });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH (update) a team's basic info
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const teamId = params.id;
  if (!teamId) {
    return NextResponse.json({ error: 'Missing team ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, video_url, submitted_by } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim() || null;
    if (video_url !== undefined) updates.video_url = video_url.trim() || null;
    if (submitted_by !== undefined) updates.submitted_by = submitted_by.trim() || 'Anonymous';

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update team', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, team: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
