import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// {
//   id: '7ea155ce-61f9-4da3-b373-205d8636bc98',
//   website_id: '4d510912-52dc-45a9-ada5-a166e260e315',
//   visitor_id: '8978fda9-2510-4bfe-867f-630cb147b0eb',
//   session_id: 'de6641e2-80be-4f83-9947-56d6ba7dd707',
//   domain: 'lorenzopalaia.it',
//   href: 'https://www.lorenzopalaia.it/experience',
//   referrer: 'https://www.lorenzopalaia.it/',
//   event_type: 'pageview',
//   extra_data: null or object,
//   created_at: '2024-10-11T16:17:38.768Z'
// }

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
    extra_data: { url: string };
    created_at: string;
  }[];
}) {
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
