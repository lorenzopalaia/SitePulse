import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";

import MainChart from "@/components/MainChart";

export default async function Dashboard({
  params,
}: {
  params: { websiteId: string };
}) {
  const supabase = createClient();

  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.user) {
    redirect("/login");
  }

  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("*")
    .eq("user_id", user.user.id)
    .eq("id", params.websiteId)
    .single();

  if (websiteError || !website) {
    return <div>Error fetching website</div>;
  }

  // Controllo dello stato di setup dal database
  if (website.setup_status === "add") {
    redirect("/new/add");
  } else if (website.setup_status === "install") {
    redirect(`/new/install?id=${website.id}&domain=${website.domain}`);
  }

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("website_id", website.id);

  if (eventsError || !events) {
    return <div>Error fetching events</div>;
  }

  const eventsTimestamps = events.map((event) => event.timestamp);

  const uniqueVisitors = new Set(events.map((event) => event.visitor_id)).size;

  //! FIX
  const sessionEvents = events.reduce((acc, event) => {
    if (event.type === "pageview") {
      acc[event.session_id] = (acc[event.session_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const singlePageSessions = Object.values(sessionEvents).filter(
    (count) => count === 1
  ).length;
  const totalSessions = Object.keys(sessionEvents).length;
  const bounceRate = (singlePageSessions / totalSessions) * 100;

  const sessionTimes = events.reduce(
    (acc: Record<string, { start: number; end: number }>, event) => {
      if (!acc[event.session_id]) {
        acc[event.session_id] = {
          start: new Date(event.timestamp).getTime(),
          end: new Date(event.timestamp).getTime(),
        };
      } else {
        acc[event.session_id].end = new Date(event.timestamp).getTime();
      }
      return acc;
    },
    {}
  );
  const sessionDurations = Object.values(sessionTimes).map(
    ({ start, end }) => end - start
  );
  const totalDuration = sessionDurations.reduce(
    (sum, duration) => sum + duration,
    0
  );
  const averageDuration = sessionDurations.length
    ? totalDuration / sessionDurations.length / 1000
    : 0;

  //! FIX
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const liveVisitors = new Set(
    events
      .filter((event) => new Date(event.timestamp).getTime() >= fiveMinutesAgo)
      .map((event) => event.visitor_id)
  ).size;

  return (
    <div className="container mx-auto">
      <h1 className="text-primary-foreground">Dashboard</h1>
      <h2 className="text-primary-foreground">Website: {website.domain}</h2>
      <MainChart
        eventsTimestamps={eventsTimestamps}
        stats={{
          visitors: uniqueVisitors,
          bounceRate,
          sessionTime: averageDuration.toString(),
          liveVisitors,
        }}
      />
    </div>
  );
}
