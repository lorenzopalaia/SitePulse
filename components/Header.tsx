"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";

import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

import { useEffect, useState } from "react";

export default function Header() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      redirect("/error");
    }
    redirect("/login");
  };

  return (
    <header className="py-4">
      <div className="container mx-auto">
        <div className="flex justify-between">
          <Link
            className="flex items-center gap-2 text-xl font-bold text-primary-foreground"
            href="/"
          >
            <Image
              src="https://datafa.st/_next/static/media/icon.3a869d3d.png"
              alt="SitePulse"
              width={24}
              height={24}
            />
            <div>SitePulse</div>
          </Link>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-slate-800 rounded-md font-semibold text-primary-foreground text-md">
                <span className="p-4">{user.email.split("@")[0]}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-0 bg-slate-800">
                <DropdownMenuLabel className="text-primary-foreground">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuItem className="text-primary-foreground">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-primary-foreground"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
