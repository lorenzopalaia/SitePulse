import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getCountryFlag } from "@/utils/countryUtils";

export default function Events({
  data,
}: {
  data: {
    id: string;
    website_id: string;
    visitor_id: string;
    session_id: string;
    domain: string;
    href: string;
    referrer: string;
    event_type: string;
    extra_data: { url: string; country: string };
    created_at: string;
  }[];
}) {
  //! Time depends on the server timezone
  //! Chart is showing the data in the correct timezone
  //! But the events are shown in the server timezone
  const events = data
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((event) => ({
      ...event,
      created_at: new Date(event.created_at).toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: undefined,
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {events.map((event) => (
            <div key={event.id}>
              <span className="text-muted-foreground">
                [{event.created_at}]
              </span>{" "}
              {getCountryFlag(event.extra_data?.country)}{" "}
              <span className="font-bold">{event.event_type}</span>
              {event.event_type === "pageview" && (
                <span className="italic">
                  {" "}
                  @ {new URL(event.href).pathname + new URL(event.href).hash}
                </span>
              )}
              {event.event_type === "external_link" && (
                <span className="italic">
                  {" "}
                  to {new URL(event.extra_data.url).hostname}
                </span>
              )}
              {event.event_type === "internal_link" && (
                <span className="italic">
                  {" "}
                  to{" "}
                  {new URL(event.extra_data.url).pathname +
                    new URL(event.extra_data.url).hash}
                </span>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
