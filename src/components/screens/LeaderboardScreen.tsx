import { useState, useEffect } from 'react';
import { GameButton } from '@/components/ui/game-button';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '@/lib/leaderboard';
import { useFarcaster } from '@/providers/FarcasterProvider';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export const LeaderboardScreen = ({ onBack }: LeaderboardScreenProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFarcaster();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await getLeaderboard();
      setEntries(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex items-center gap-4">
        <GameButton variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-black">Leaderboard</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-muted-foreground">No scores yet</p>
            <p className="text-sm text-muted-foreground">Be the first to play!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => {
              const isCurrentUser = user && entry.fid === user.fid;
              return (
                <div
                  key={entry.id}
                  className={`bg-card rounded-lg p-4 flex items-center gap-4 shadow-card hover:shadow-glow transition-all ${
                    isCurrentUser ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div
                    className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full ${
                      index === 0
                        ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                        : index === 1
                        ? 'bg-success/20 text-success'
                        : index === 2
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  
                  {entry.pfp_url ? (
                    <img 
                      src={entry.pfp_url} 
                      alt={entry.display_name || entry.username || 'User'} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      ?
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground truncate">
                      {entry.display_name || entry.username || `FID: ${entry.fid}`}
                    </div>
                    {entry.username && (
                      <div className="text-xs text-muted-foreground">@{entry.username}</div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-primary">{entry.score}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Play in Warpcast to appear on the leaderboard
      </div>
    </div>
  );
};
