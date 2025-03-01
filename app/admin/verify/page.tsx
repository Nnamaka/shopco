"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

 function VerifyMagicLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError("Invalid token.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/verify-magic-link", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const data = await res.json();
        const result = await signIn("magic-link", {
          email: data.email,
          token,
          redirect: false,
        });

        if (result?.error) {
          setError("Authentication failed");
          setLoading(false);
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        setError("Invalid or expired magic link.");
        setLoading(false);
      }
    }

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {loading ? (
        <p>Verifying magic link...</p>
      ) : (
        <p className="text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function VerifyMagicLinkSuspence() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyMagicLink />
    </Suspense>
  );
}