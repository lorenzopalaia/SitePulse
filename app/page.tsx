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

  // const visitors = websites.reduce((acc, website) => acc + website.visitors, 0);
  const visitors = 100;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <p className="text-primary-foreground">
          You got <span className="font-bold">{visitors}</span> visitors in the
          last 24 hours.
        </p>
        <Link href="/new/add">
          <Button className="bg-slate-800">
            <Plus size={16} className="mr-2" />
            Website
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-8">
        {websites &&
          websites.map((website) => (
            <Link key={website.id} href={`/dashboard/${website.id}`}>
              <Card className="border-0 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">
                    {website.domain}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-primary-foreground">
                    Plot Goes Here
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <CardDescription className="text-primary-foreground">
                    <span className="font-bold">{website.visitors}</span>{" "}
                    visitors
                  </CardDescription>
                </CardFooter>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
