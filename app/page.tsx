import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import PlainChart from "@/components/PlainChart";

import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = createClient();

  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.user) {
    redirect("/login");
  }

  const { data: websites, error: websitesError } = await supabase
    .from("websites")
    .select("*")
    .eq("user_id", user.user.id);
  if (websitesError || !websites) {
    return <div>Error fetching websites</div>;
  }

  // get all events for each website
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .in(
      "website_id",
      websites.map((website) => website.id)
    );
  if (eventsError || !events) {
    return <div>Error fetching events</div>;
  }

  // TODO: turn into a table view in supabase
  const websitesWithVisitors = websites.map((website) => {
    const websiteEvents = events.filter(
      (event) => event.website_id === website.id
    );
    const uniqueVisitors = new Set(
      websiteEvents
        .filter(
          (event) =>
            new Date(event.timestamp).getTime() >
            Date.now() - 24 * 60 * 60 * 1000
        )
        .map((event) => event.visitor_id)
    ).size;
    const eventsTimestamps = websiteEvents.map((event) => event.timestamp);
    return {
      ...website,
      visitors: uniqueVisitors,
      eventsTimestamps: eventsTimestamps,
    };
  });

  // count total visitors in the last 24 hours
  const totalVisitors = websitesWithVisitors.reduce(
    (acc, website) => acc + website.visitors,
    0
  );

  return (
    <div className="container mx-auto pt-8">
      <div className="flex justify-between items-center">
        <p className="font-bold text-foreground/75">
          You got <span className="text-foreground">{totalVisitors}</span>{" "}
          visitors in the last 24 hours.
        </p>
        <Link href="/new/add">
          <Button variant="secondary" className="font-bold">
            <Plus size={16} className="mr-2" />
            Website
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {websitesWithVisitors &&
          websitesWithVisitors.map((website) => (
            <Link key={website.id} href={`/dashboard/${website.id}`}>
              <Card className="">
                <CardHeader>
                  <CardTitle>{website.domain}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlainChart eventsTimestamps={website.eventsTimestamps} />
                </CardContent>
                <CardFooter>
                  <CardDescription className="text-foreground/75">
                    <span className="font-bold text-foreground">
                      {website.visitors}
                    </span>{" "}
                    {website.visitors === 1 ? "visitor" : "visitors"}
                  </CardDescription>
                </CardFooter>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
