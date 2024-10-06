import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";

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

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Website ID: {params.websiteId}</p>
    </div>
  );
}
