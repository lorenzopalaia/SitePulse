"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

// Schema di validazione con Zod
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginPage() {
  const supabase = createClient();

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.push("/");
      }
    };
    checkUser();
  }, [supabase, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const toast = useToast();

  async function handleSubmit(
    values: z.infer<typeof formSchema>,
    action: "login" | "signup"
  ) {
    const { email, password } = values;

    let error;
    if (action === "login") {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    } else {
      ({ error } = await supabase.auth.signUp({ email, password }));
    }

    if (error) {
      console.error(`Error during ${action}:`, error.message);
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      router.push("/");
    }
  }

  return (
    <div className="container mx-auto">
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@gmail.com" {...field} />
                </FormControl>
                <FormDescription>
                  We&apos;ll never share your email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>
                  Must be at least 8 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={form.handleSubmit((values) =>
                handleSubmit(values, "login")
              )}
            >
              Log in
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit((values) =>
                handleSubmit(values, "signup")
              )}
            >
              Sign up
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
