import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Provocative notification templates - aggressive and engaging! 🔥
const provocativeMessages = [
  {
    title: "🪡 Poke Alert",
    getBody: (leader: string, score: number) => 
      `Hey… yeah YOU 👀 @${leader} is still on top with ${score}pts. Your name? Missing 😏`
  },
  {
    title: "😴 Comfort Zone Detected",
    getBody: (leader: string, score: number) => 
      `Leaderboard untouched. @${leader} still reigns with ${score}pts. Are you warming up… or scared? 👀🎮`
  },
  {
    title: "👑 King Update",
    getBody: (leader: string, score: number) => 
      `@${leader} still on the throne with ${score}pts. No challengers today? That's awkward 😬`
  },
  {
    title: "📉 Skill Issue?",
    getBody: (leader: string, score: number) => 
      `Game is simple. @${leader}'s ${score}pts says otherwise 😌 Think you can do better?`
  },
  {
    title: "🤏 Just One Tap",
    getBody: (leader: string, score: number) => 
      `One run. One score. Or is that too much pressure? @${leader} didn't think so → ${score}pts 😈`
  },
  {
    title: "🔥 Ego Check",
    getBody: (leader: string, score: number) => 
      `If you think "I can beat @${leader}'s ${score}pts"… prove it. Or keep scrolling 😏`
  },
  {
    title: "🐔 Chicken Detector",
    getBody: (leader: string, score: number) => 
      `@${leader} owns the top with ${score}pts. Cluck or click? 🐔🎮`
  },
  {
    title: "👀 Ghost Mode?",
    getBody: (leader: string, score: number) => 
      `@${leader} scored ${score}pts. You? Invisible. Change that 💪`
  },
  {
    title: "🎯 Daily Challenge",
    getBody: (leader: string, score: number) => 
      `Target: Beat @${leader}'s ${score}pts. Difficulty: Depends on you 🎮`
  },
  {
    title: "💀 Reality Check",
    getBody: (leader: string, score: number) => 
      `@${leader} → ${score}pts. You → excuses. Time to change that? 💀`
  }
];

// Fallback messages when no leader exists
const noLeaderMessages = [
  { title: "🏆 Empty Throne", body: "Leaderboard is wide open. First to play = first to reign 👑" },
  { title: "👻 Ghost Town", body: "No scores yet. Be the legend who starts it all 🎮" },
  { title: "🎯 Fresh Start", body: "Leaderboard reset. Your chance to dominate! 🔥" }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active notification subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from("notification_subscribers")
      .select("*")
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${subscribers?.length || 0} active subscribers`);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No active subscribers to notify" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get top player from leaderboard for the notification message
    const { data: topPlayer } = await supabase
      .from("leaderboard")
      .select("username, score")
      .order("score", { ascending: false })
      .limit(1)
      .single();

    // Randomly select a provocative message
    let notificationTitle: string;
    let notificationBody: string;
    
    if (topPlayer && topPlayer.username) {
      const randomIndex = Math.floor(Math.random() * provocativeMessages.length);
      const selectedMessage = provocativeMessages[randomIndex];
      notificationTitle = selectedMessage.title;
      notificationBody = selectedMessage.getBody(topPlayer.username, topPlayer.score);
      console.log(`Selected message #${randomIndex}: ${notificationTitle}`);
    } else {
      // No leader yet - use fallback messages
      const randomIndex = Math.floor(Math.random() * noLeaderMessages.length);
      const selectedMessage = noLeaderMessages[randomIndex];
      notificationTitle = selectedMessage.title;
      notificationBody = selectedMessage.body;
      console.log(`No leader - using fallback message #${randomIndex}`);
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send notification to each subscriber
    for (const subscriber of subscribers) {
      try {
        const response = await fetch(subscriber.notification_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: crypto.randomUUID(),
            title: notificationTitle,
            body: notificationBody,
            targetUrl: "https://base-glide.lovable.app", // Update with your actual URL
            tokens: [subscriber.notification_token],
          }),
        });

        if (response.ok) {
          results.sent++;
          console.log(`Notification sent to FID ${subscriber.fid}`);
        } else {
          const errorText = await response.text();
          results.failed++;
          results.errors.push(`FID ${subscriber.fid}: ${errorText}`);
          console.error(`Failed to send to FID ${subscriber.fid}:`, errorText);
          
          // If token is invalid, deactivate the subscriber
          if (response.status === 404 || response.status === 410) {
            await supabase
              .from("notification_subscribers")
              .update({ is_active: false })
              .eq("id", subscriber.id);
            console.log(`Deactivated invalid subscriber FID ${subscriber.fid}`);
          }
        }
      } catch (error: unknown) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`FID ${subscriber.fid}: ${errorMessage}`);
        console.error(`Error sending to FID ${subscriber.fid}:`, error);
      }

      // Rate limiting: wait 100ms between notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Notification results: ${results.sent} sent, ${results.failed} failed`);

    return new Response(JSON.stringify({ 
      success: true,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Send notification error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
