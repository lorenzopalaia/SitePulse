"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ArrowLeft, CircleCheck, Copy, Loader2 } from "lucide-react";

import Link from "next/link";

import { useState, useEffect } from "react";

import { createClient } from "@/utils/supabase/client";

import { User } from "@supabase/supabase-js";

import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// @ts-expect-error missing types
import { v4 as uuidv4 } from "uuid";

const PulseDot = ({ active }: { active: boolean }) => (
  <span className="relative flex items-center justify-center size-4">
    {active && (
      <span
        className={
          "absolute inline-flex w-full h-full rounded-full opacity-75 bg-primary animate-ping"
        }
      ></span>
    )}
    <span
      className={`relative inline-flex size-2.5 rounded-full ${
        active ? "bg-primary" : "bg-muted-foreground"
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
    return <CircleCheck size={16} className="text-primary" />;
  }
  return <PulseDot active={isActive} />;
};

export default function New({ params }: { params: { setup: string } }) {
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<"add" | "install" | "done">(
    params.setup as "add" | "install" | "done"
  );
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const toast = useToast();

  const domainRegex = /^(?!www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const supabase = createClient();

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

  useEffect(() => {
    const websiteId = searchParams.get("id");
    const websiteDomain = searchParams.get("domain");
    if (websiteId) setId(websiteId);
    if (websiteDomain) setDomain(websiteDomain);
  }, [searchParams]);

  const handleAdd = async () => {
    setLoading(true);
    const id = uuidv4();
    setId(id);
    setSetupStatus("install");
    const { error } = await supabase.from("websites").insert([
      {
        id,
        user_id: user?.id,
        domain,
        setup_status: "install",
      },
    ]);
    if (error) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
    setLoading(false);
  };

  const handleInstall = async () => {
    setLoading(true);
    const scriptToCheck = `data-website-id="${id}"`;

    const response = await fetch("/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain, scriptToCheck }),
    });

    const result = await response.json();

    if (!result.success) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("websites")
      .update({ setup_status: "done" })
      .eq("id", id);

    if (error) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setLoading(false);
      return;
    }
    setSetupStatus("done");
    setLoading(false);
  };

  return (
    <div className="container mx-auto">
      <div className="mx-8">
        <Link href="/">
          <Button variant="secondary">
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
              className={`ml-2 font-bold ${
                setupStatus === "add" ? "text-primary" : "text-muted-foreground"
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
              className={`ml-2 font-bold ${
                setupStatus === "install"
                  ? "text-primary"
                  : "text-muted-foreground"
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
              className={`ml-2 font-bold ${
                setupStatus === "done"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Done
            </span>
          </div>
        </div>
        {setupStatus === "add" && (
          <div className="pt-8">
            <Card>
              <CardHeader>
                <CardTitle>Add a new website</CardTitle>
                <CardDescription className="font-bold">
                  Enter your website details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Label>Domain</Label>
                <div className="flex items-center">
                  <div className="bg-secondary border-2 py-1 px-2 rounded rounded-r-none">
                    https://
                  </div>
                  <Input
                    type="text"
                    placeholder="example.com"
                    className="w-full p-2 join-item border-l-0 rounded-l-none"
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
                <Button
                  disabled={!domain || !domainRegex.test(domain) || loading}
                  className="w-full mt-4 font-bold"
                  onClick={() => handleAdd()}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Please wait" : "Add website"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        {setupStatus === "install" && (
          <div className="pt-8">
            <Card>
              <CardHeader>
                <CardTitle>Install the SitePulse script</CardTitle>
                <CardDescription className="font-bold">
                  Paste this snippet in the <code>&lt;head&gt;</code> of your
                  website
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="bg-foreground/10 p-4 rounded-md break-all text-sm">
                  <code>
                    {`<script defer data-website-id="${id}" data-domain="${domain}" src="${origin}/js/script.js"></script>`}
                  </code>
                </div>
                <Button
                  className="absolute top-4 right-10"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<script defer data-website-id="${id}" data-domain="${domain}" src="${origin}/js/script.js"></script>`
                    );
                  }}
                >
                  <Copy size={16} />
                </Button>
                <Button
                  disabled={loading}
                  className="w-full mt-4 font-bold"
                  onClick={() => handleInstall()}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Please wait" : "Check installation"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        {setupStatus === "done" && (
          <div className="pt-8">
            <Card>
              <CardHeader>
                <CardTitle>Setup Complete</CardTitle>
                <CardDescription className="font-bold">
                  Your website has been successfully added
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/${id}`}>
                  <Button className="w-full mt-4 font-bold">
                    Go to dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
