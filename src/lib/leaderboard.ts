import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  fid: number;
  username: string | null;
  display_name: string | null;
  pfp_url: string | null;
  score: number;
  created_at: string | null;
  updated_at: string | null;
}

export const submitScore = async (
  fid: number,
  username: string | undefined,
  displayName: string | undefined,
  pfpUrl: string | undefined,
  score: number
): Promise<boolean> => {
  try {
    // Check existing score
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('fid', fid)
      .single();

    // Only update if new score is higher
    if (existing && existing.score >= score) {
      return false;
    }

    const { error } = await supabase
      .from('leaderboard')
      .upsert({
        fid,
        username: username ?? null,
        display_name: displayName ?? null,
        pfp_url: pfpUrl ?? null,
        score,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'fid',
      });

    if (error) {
      console.error('Error submitting score:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error submitting score:', err);
    return false;
  }
};

export const getLeaderboard = async (limit = 50): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data as LeaderboardEntry[];
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
};
