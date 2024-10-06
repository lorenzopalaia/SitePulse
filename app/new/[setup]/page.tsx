"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Link from "next/link";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import { User } from "@supabase/supabase-js";

import { useSearchParams } from "next/navigation";

// @ts-expect-error missing types
import { v4 as uuidv4 } from "uuid";

const PulseDot = ({ active }: { active: boolean }) => (
  <span className="relative flex items-center justify-center size-4">
    {active && (
      <span
        className={
          "absolute inline-flex w-full h-full rounded-full opacity-75 bg-slate-500 animate-ping"
        }
      ></span>
    )}
    <span
      className={`relative inline-flex size-2.5 rounded-full ${
        active ? "bg-slate-500" : "bg-primary-foreground"
      }`}
    ></span>
  </span>
);

const StepIcon = ({
  isActive,
  isCompleted,
}: {
  isActive: boolean;
  isCompleted: boolean;
}) => {
  if (isCompleted) {
    return <CircleCheck size={16} className="text-primary-foreground" />;
  }
  return <PulseDot active={isActive} />;
};

export default function New({ params }: { params: { setup: string } }) {
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<"add" | "install" | "done">(
    params.setup as "add" | "install" | "done"
  );
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const websiteId = searchParams.get("id");
    const websiteDomain = searchParams.get("domain");
    if (websiteId) setId(websiteId);
    if (websiteDomain) setDomain(websiteDomain);
  }, [searchParams]);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        redirect("/login");
      }
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  const timezones = [
    "Europe/Rome",
    "Europe/London",
    "America/New York",
    "America/Los Angeles",
  ];

  const handleAdd = async () => {
    setLoading(true);
    const id = uuidv4();
    setId(id);
    setSetupStatus("install");
    try {
      const { error } = await supabase.from("websites").insert([
        {
          id,
          user_id: user?.id,
          domain,
          timezone,
          setup_status: "install",
        },
      ]);
      if (error) throw error;
      setLoading(false);
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  const handleInstall = async () => {
    try {
      const scriptToCheck = `<script defer data-website-id="${id}" data-domain="${domain}" src="https://sitepul.se/js/script.js"></script>`;

      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, scriptToCheck }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Script not found");
      }

      setSetupStatus("done");

      const { error } = await supabase
        .from("websites")
        .update({ setup_status: "done" })
        .eq("website_id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error checking installation:", error);
    }
  };

  return (
    <div className="container mx-auto">
      <Link href="/">
        <Button className="bg-slate-800">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
      </Link>
      <div className="flex gap-8 pt-8">
        <div className="flex items-center">
          <StepIcon
            isActive={setupStatus === "add"}
            isCompleted={setupStatus !== "add"}
          />
          <span
            className={`ml-2 ${
              setupStatus === "add"
                ? "text-slate-500"
                : "text-primary-foreground"
            }`}
          >
            Add site
          </span>
        </div>
        <div className="flex items-center">
          <StepIcon
            isActive={setupStatus === "install"}
            isCompleted={setupStatus === "done"}
          />
          <span
            className={`ml-2 ${
              setupStatus === "install"
                ? "text-slate-500"
                : "text-primary-foreground"
            }`}
          >
            Install tracking code
          </span>
        </div>
        <div className="flex items-center">
          <StepIcon
            isActive={setupStatus === "done"}
            isCompleted={setupStatus === "done"}
          />
          <span
            className={`ml-2 ${
              setupStatus === "done"
                ? "text-slate-500"
                : "text-primary-foreground"
            }`}
          >
            Done
          </span>
        </div>
      </div>
      {setupStatus === "add" && (
        <div className="pt-8">
          <Card className="border-0 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-primary-foreground">
                Add a new website
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-primary-foreground">Domain</Label>
              <Input
                type="text"
                placeholder="https://example.com"
                className="w-full p-2 rounded-lg bg-slate-800 text-primary-foreground border-slate-500/25"
                onChange={(e) => setDomain(e.target.value)}
              />
              <Label className="text-primary-foreground mt-4">Timezone</Label>
              <Select
                onValueChange={(value) => {
                  setTimezone(value);
                }}
              >
                <SelectTrigger className="w-full border-slate-500/25 text-primary-foreground">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-0">
                  {timezones.map((timezone) => (
                    <SelectItem
                      key={timezone}
                      value={timezone}
                      className="text-primary-foreground"
                    >
                      {timezone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full mt-4 bg-slate-700"
                onClick={() => handleAdd()}
              >
                Add
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {setupStatus === "install" && (
        <div className="pt-8">
          <p className="text-primary-foreground">
            Install the tracking code on your site
          </p>
          <pre className="p-4 mt-4 rounded-lg bg-slate-800 text-primary-foreground">
            {`<script defer data-website-id="${id}"
                data-domain="${domain}"
                src="https://sitepul.se/js/script.js">
              </script>`}
          </pre>
          <Button className="w-full mt-4" onClick={() => handleInstall()}>
            Check installation
          </Button>
        </div>
      )}
      {setupStatus === "done" && (
        <div className="pt-8">
          <p className="text-primary-foreground">
            Your website has been successfully added
          </p>
          <Link href={`/dahboard/${id}`}>
            <Button className="w-full mt-4">Go to dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
