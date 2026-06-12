"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useAppContext } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/projects");
    }
  }, [isAuthenticated, router]);

  function handleSubmit(event) {
    event.preventDefault();
    login({ email, password });
    router.replace("/projects");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,130,245,0.16),transparent_35%)]" />
      <div className="relative w-full max-w-md rounded-[28px] border border-[#E4EBF7] bg-white/95 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
        <Logo />
        <div className="mt-10">
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
            Sign in to Ledger
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Use any email and password to enter the demo workspace and choose a
            project from the hub.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ledger-ink">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alex@ledger.demo"
              className="ledger-input"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ledger-ink">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Any password"
              className="ledger-input"
            />
          </label>
          <div className="rounded-[16px] bg-ledger-mist px-4 py-3 text-sm text-slate-500">
            Demo access: any credentials are accepted in this portfolio build.
          </div>
          <button
            type="submit"
            className="ledger-button ledger-button-primary w-full"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
