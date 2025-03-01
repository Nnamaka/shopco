"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
});

interface FormData {
  email: string;
}

export default function AdminLogin() {
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);

  //   const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    const res = await fetch("/api/magic-link", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setMagicSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      {!magicSent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80 mt-4">
          <Input
            type="email"
            placeholder="Enter your admin email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? "Loading..." : "Get Magic Link"}
          </Button>
        </form>
      ) : (
        <p>Check your email for the magic link.</p>
      )}
    </div>
  );
}
