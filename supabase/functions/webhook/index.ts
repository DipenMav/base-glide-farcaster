import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload, null, 2));

    const { event, data } = payload;

    switch (event) {
      case "frame_added": {
        // User added the mini app with notifications enabled
        const { fid, notificationDetails } = data;
        
        if (notificationDetails?.url && notificationDetails?.token) {
          console.log(`User ${fid} added mini app with notifications`);
          
          const { error } = await supabase
            .from("notification_subscribers")
            .upsert({
              fid,
              notification_url: notificationDetails.url,
              notification_token: notificationDetails.token,
              is_active: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "fid,notification_url",
            });

          if (error) {
            console.error("Error saving notification subscriber:", error);
          } else {
            console.log(`Successfully saved notification for user ${fid}`);
          }
        }
        break;
      }

      case "frame_removed": {
        // User removed the mini app
        const { fid } = data;
        console.log(`User ${fid} removed mini app`);
        
        const { error } = await supabase
          .from("notification_subscribers")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("fid", fid);

        if (error) {
          console.error("Error deactivating notification subscriber:", error);
        }
        break;
      }

      case "notifications_enabled": {
        // User re-enabled notifications
        const { fid, notificationDetails } = data;
        console.log(`User ${fid} enabled notifications`);
        
        if (notificationDetails?.url && notificationDetails?.token) {
          const { error } = await supabase
            .from("notification_subscribers")
            .upsert({
              fid,
              notification_url: notificationDetails.url,
              notification_token: notificationDetails.token,
              is_active: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "fid,notification_url",
            });

          if (error) {
            console.error("Error updating notification subscriber:", error);
          }
        }
        break;
      }

      case "notifications_disabled": {
        // User disabled notifications
        const { fid } = data;
        console.log(`User ${fid} disabled notifications`);
        
        const { error } = await supabase
          .from("notification_subscribers")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("fid", fid);

        if (error) {
          console.error("Error deactivating notification subscriber:", error);
        }
        break;
      }

      default:
        console.log(`Unknown event: ${event}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
