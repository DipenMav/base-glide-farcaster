-- Create leaderboard table for storing player scores
CREATE TABLE public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fid INTEGER UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  pfp_url TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on leaderboard
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Public read access for leaderboard
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

-- Public insert for leaderboard (Farcaster users can submit scores)
CREATE POLICY "Anyone can insert scores" ON public.leaderboard
  FOR INSERT WITH CHECK (true);

-- Public update for leaderboard (to update high scores)
CREATE POLICY "Anyone can update scores" ON public.leaderboard
  FOR UPDATE USING (true);

-- Create notification_subscribers table for daily notifications
CREATE TABLE public.notification_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fid INTEGER NOT NULL,
  notification_url TEXT NOT NULL,
  notification_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fid, notification_url)
);

-- Enable RLS on notification_subscribers
ALTER TABLE public.notification_subscribers ENABLE ROW LEVEL SECURITY;

-- Only allow edge functions to access notification_subscribers (service role)
CREATE POLICY "Service role can manage notification_subscribers" ON public.notification_subscribers
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_subscribers_updated_at
  BEFORE UPDATE ON public.notification_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();