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

  return (
    <div className="container mx-auto">
      <h1 className="text-primary-foreground">Dashboard</h1>
      <h2 className="text-primary-foreground">Website: {website.domain}</h2>
      <MainChart eventsTimestamps={eventsTimestamps} />
    </div>
  );
}
