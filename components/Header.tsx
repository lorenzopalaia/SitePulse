"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";

import ThemeToggle from "@/components/ThemeToggle";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

import { useEffect, useState } from "react";

export default function Header() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          router.push("/login");
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to get user", error);
        router.push("/login");
      }
    };
    getUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/error");
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <header className="py-4">
      <div className="container mx-auto">
        <div className="flex justify-between">
          <Link className="flex items-center gap-2 text-xl font-bold" href="/">
            <Image
              src="https://datafa.st/_next/static/media/icon.3a869d3d.png"
              alt="SitePulse"
              width={24}
              height={24}
            />
            <div>SitePulse</div>
          </Link>
          <div className="flex gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md font-semibold text-md border">
                  <span className="p-4">{user?.email?.split("@")[0]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
