"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Field } from "@/components/ui";
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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Form panel — first on mobile, right on desktop. */}
      <div className="order-1 flex w-full items-center justify-center px-6 py-14 sm:px-10 lg:order-2 lg:w-1/2">
        <div className="w-full max-w-[360px]">
          <Logo />
          <h1 className="display mt-10 text-[30px] text-ink">Sign in</h1>
          <p className="mt-2 text-[13.5px] text-muted">
            Any email and password opens the demo workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alex@ledger.demo"
                className="field"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Any password"
                className="field"
              />
            </Field>
            <button type="submit" className="btn btn-primary w-full">
              Sign in
            </button>
          </form>

          <p className="label mt-6 leading-relaxed">
            Demo access — credentials are not verified in this build.
          </p>
        </div>
      </div>

      {/*
        Editorial panel — below on mobile, left on desktop.

        `grow` matters on mobile: the two panels stack, and on a tall phone their
        combined height falls short of the `min-h-screen` container, leaving a
        strip of white under this one. Growing lets it take up the slack so the
        ink block reaches the bottom of the screen. It is turned off at `lg`,
        where the panels are side by side and each already claims half the width.
      */}
      <div className="order-2 flex w-full grow flex-col justify-between gap-12 bg-ink px-8 py-12 text-white sm:px-12 lg:order-1 lg:min-h-screen lg:w-1/2 lg:grow-0 lg:px-16 lg:py-16">
        <div className="label flex items-center gap-4 text-white/50">
          Ledger
          <span className="h-px flex-1 bg-white/20" />
        </div>
        <div className="max-w-md">
          <p className="display text-[38px] sm:text-[46px]">
            Every client,
            <br />
            on the record.
          </p>
          <p className="mt-5 max-w-sm text-[13.5px] leading-6 text-white/60">
            Every conversation, campaign and milestone in one place — so nothing
            about your clients ever slips through the cracks.
          </p>
        </div>
        <div className="label text-white/40">Agency operating system</div>
      </div>
    </div>
  );
}
