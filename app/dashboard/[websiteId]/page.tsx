import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";

import MainChart from "@/components/MainChart";

import Referrers from "@/components/Referrers";
import Pages from "@/components/Pages";
import ExternalLinks from "@/components/ExternalLinks";
import InternalLinks from "@/components/InternalLinks";
import Countries from "@/components/Countries";
import OperatingSystems from "@/components/OperatingSystems";
import EventsList from "@/components/EventsList";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

//! There is an error here:
//! Type error: Type '{ params: { websiteId: string; }; }' does not satisfy the constraint 'PageProps'.
//!   Types of property 'params' are incompatible.
//!     Type '{ websiteId: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally, [Symbol.toStringTag]
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

  //* Redirect to setup pages if website is not fully set up
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

  //* Convert UTC timestamps to local time
  events.forEach((event) => {
    const utcDate = new Date(event.created_at);
    const localOffsetInMinutes = utcDate.getTimezoneOffset();
    const localTime = new Date(
      utcDate.getTime() - localOffsetInMinutes * 60000
    );
    event.created_at = localTime.toISOString();
  });

  //! Latest timestamps are not showed in the chart, maybe because of the timezone conversion
  //! Need to investigate further

  const eventsTimestamps = events.map((event) => event.created_at);

  const uniqueVisitors = new Set(events.map((event) => event.visitor_id));

  // TODO: implement two lines in the chart then uncomment this
  /*
  const uniqueVisitorsTimestamps = Array.from(uniqueVisitors).map((visitor) => {
    const visitorEvents = events.filter(
      (event) => event.visitor_id === visitor
    );
    const mostRecentEvent = visitorEvents.reduce(
      (acc, event) => {
        if (new Date(event.created_at) > new Date(acc.created_at)) {
          return event;
        }
        return acc;
      },
      { timestamp: "0" }
    );
    return mostRecentEvent.created_at;
  });
  */

  const sessionEvents = events.reduce((acc, event) => {
    if (event.event_type === "pageview") {
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
          start: new Date(event.created_at).getTime(),
          end: new Date(event.created_at).getTime(),
        };
      } else {
        acc[event.session_id].end = new Date(event.created_at).getTime();
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

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const liveVisitors = new Set(
    events
      .filter((event) => new Date(event.created_at).getTime() >= fiveMinutesAgo)
      .map((event) => event.visitor_id)
  ).size;

  let referrers = events
    .filter((event) => event.referrer)
    .reduce((acc, event) => {
      let { hostname } = new URL(event.referrer);
      if (hostname.startsWith("www.")) {
        hostname = hostname.slice(4);
      }
      acc[hostname] = (acc[hostname] || 0) + 1;
      return acc;
    }, {});
  referrers = Object.entries(referrers).map(([referrer, count]) => ({
    referrer,
    count,
  }));

  let pages = events
    .filter((event) => event.href)
    .reduce((acc, event) => {
      let { pathname } = new URL(event.href);
      pathname = pathname.replace(/(https?:\/\/[^/]+)?/, "") || "/"; // Sostituisce stringa vuota con "/"
      acc[pathname] = (acc[pathname] || 0) + 1;
      return acc;
    }, {});
  pages = Object.entries(pages).map(([page, count]) => ({
    page: page.replace(/\/$/, "").replace(/\/index$/, "/") || "/", // Sostituisce stringa vuota con "/"
    count,
  }));

  let externalLinks = events
    .filter((event) => event.event_type === "external_link")
    .reduce((acc, event) => {
      const hostname = event.extra_data.url;
      acc[hostname] = (acc[hostname] || 0) + 1;
      return acc;
    }, {});
  externalLinks = Object.entries(externalLinks).map(([link, count]) => ({
    link,
    count,
  }));

  let internalLinks = events
    .filter((event) => event.event_type === "internal_link")
    .reduce((acc, event) => {
      const { pathname, hash } = new URL(event.extra_data.url);
      const url = pathname + hash;
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {});
  internalLinks = Object.entries(internalLinks).map(([link, count]) => ({
    link,
    count,
  }));

  let countries = events.reduce((acc, event) => {
    const country = event.extra_data.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
  countries = Object.entries(countries).map(([country, count]) => ({
    country,
    count,
  }));

  let operatingSystems = events.reduce((acc, event) => {
    const os = event.extra_data.os || "Unknown";
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {});
  operatingSystems = Object.entries(operatingSystems).map(([os, count]) => ({
    os,
    count,
  }));

  /* let browsers = events.reduce((acc, event) => {
    const browser = event.extra_data.browser || "Unknown";
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});
  browsers = Object.entries(browsers).map(([browser, count]) => ({
    browser,
    count,
  })); */

  /* let devices = events.reduce((acc, event) => {
    const device = event.extra_data.device || "Unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  devices = Object.entries(devices).map(([device, count]) => ({
    device,
    count,
  })); */

  return (
    <div className="container py-12 mx-auto">
      <div className="mx-8">
        <Link href="/">
          <Button variant="secondary" className="font-bold">
            <ArrowLeft size={16} className="mr-2" />
            Dashboard
          </Button>
        </Link>
        <h1 className="pb-8 pt-4 text-xl font-semibold">{website.domain}</h1>
        <MainChart
          timestamps={eventsTimestamps}
          stats={{
            visitors: uniqueVisitors.size,
            events: events.length,
            bounceRate,
            sessionTime: averageDuration.toString(),
            liveVisitors,
          }}
        />
        <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-2">
          <Referrers data={referrers} />
          <Pages data={pages} />
          <ExternalLinks data={externalLinks} />
          <InternalLinks data={internalLinks} />
          <Countries data={countries} />
          <OperatingSystems data={operatingSystems} />
        </div>
        <div className="pt-8">
          <EventsList data={events} />
        </div>
      </div>
    </div>
  );
}
