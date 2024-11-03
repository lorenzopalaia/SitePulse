"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getCountryFlag } from "@/utils/countryUtils";

import { X } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";

import { User } from "@supabase/supabase-js";

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
  const supabase = createClient();

  const router = useRouter();

  const toast = useToast();

  const [, setUser] = useState<User | null>(null);

  // * This is the event id to be deleted
  const [event, setEvent] = useState<string>("");

  // ! Time depends on the server timezone
  // ! Chart is showing the data in the correct timezone
  // ! But the events are shown in the server timezone
  const [events, setEvents] = useState(data);

  useEffect(() => {
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
    setEvents(events);
  }, [data]);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login");
      }
      setUser(data.user);
    };
    getUser();
  }, [supabase, router]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
    setEvents((events) => events.filter((event) => event.id !== id));
  };

  return (
    <>
      <AlertDialog>
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between gap-2 items-center"
                >
                  <div>
                    <span className="text-muted-foreground">
                      [{event.created_at}]
                    </span>{" "}
                    {getCountryFlag(event.extra_data?.country)}{" "}
                    <span className="font-bold">{event.event_type}</span>
                    {event.event_type === "pageview" && (
                      <span className="italic">
                        {" "}
                        @{" "}
                        {new URL(event.href).pathname +
                          new URL(event.href).hash}
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
                  <AlertDialogTrigger asChild>
                    <X
                      className="mr-2 cursor-pointer"
                      onClick={() => setEvent(event.id)}
                    />
                  </AlertDialogTrigger>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete(event);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
