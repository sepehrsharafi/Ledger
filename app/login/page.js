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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Form panel — top on mobile, right on desktop */}
      <div className="order-1 flex w-full items-center justify-center px-6 py-12 sm:px-10 lg:order-2 lg:w-1/2 lg:py-16">
        <div className="w-full max-w-md">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="mt-10 text-center">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              Sign in to Ledger
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Use any email and password to enter the demo workspace and choose a
              project from the hub.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Any password"
                  className="ledger-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition-colors hover:text-ledger-ink"
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.4 5.1A9.6 9.6 0 0112 4.8c5.5 0 9 4.7 9 7.2a10.9 10.9 0 01-2.6 3.4M6.1 6.1C3.8 7.6 2.4 10 2.4 12c0 1.6 1.4 4 3.7 5.5A9.5 9.5 0 0012 19.2a9.7 9.7 0 003.6-.7" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.4 12S5.5 5.2 12 5.2 21.6 12 21.6 12 18.5 18.8 12 18.8 2.4 12 2.4 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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

      {/* Decorative panel — below on mobile, left on desktop */}
      <div className="relative order-2 flex min-h-[260px] w-full flex-col justify-between overflow-hidden bg-ledger-ink p-8 text-white sm:p-10 lg:order-1 lg:min-h-screen lg:w-1/2 lg:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(91,130,245,0.55),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(124,58,237,0.5),transparent_45%),linear-gradient(140deg,#2b58e8_0%,#5b82f5_38%,#7c3aed_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(236,72,153,0.32),transparent_55%)]" />
        <div className="relative flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
          A Wise Quote
          <span className="h-px flex-1 bg-white/30" />
        </div>
        <div className="relative max-w-md">
          <p className="text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Every client,
            <br />
            on the record.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            Keep every conversation, task, and milestone in one place — so nothing
            about your clients ever slips through the cracks.
          </p>
        </div>
      </div>
    </div>
  );
}
