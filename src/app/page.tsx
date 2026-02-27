import Navbar from "@/components/Navbar";
import { appContent } from "@/utils/content";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-900 text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-24 pt-32 sm:px-12 lg:px-16 lg:pt-40">
        {/* Background Gradient Layers */}
        <div className="absolute inset-0 -z-20 bg-hero" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.25),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.25),transparent_32%),radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.2),transparent_28%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-glass px-4 py-2 text-sm font-medium text-primary shadow-[0_10px_50px_-25px_rgba(37,99,235,0.45)] ring-1 ring-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Now with real-time messaging
              </div>

              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-bold leading-tight text-text-primary dark:text-accent-dark sm:text-5xl lg:text-6xl">
                  {appContent.hero.title}
                </h1>
                <p className="text-lg text-text-secondary sm:text-xl dark:text-blue-400">
                  {appContent.hero.subtitle}
                </p>
                <p className="text-base text-text-muted sm:text-lg dark:text-shadow-accent-dark">
                  {appContent.hero.description}
                </p>
              </div>

              <div className="w-full">
                <SignInButton>
                  <button className="group rounded-xl bg-linear-to-r from-primary via-primary to-secondary px-12 py-4 text-base font-semibold text-white shadow-[0_20px_80px_-32px_rgba(37,99,235,0.75)] transition-all duration-200 hover:translate-y-0.5 hover:shadow-[0_25px_100px_-30px_rgba(124,58,237,0.7)]">
                    <span className="flex items-center gap-2">
                      {appContent.hero.ctaButton}
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </button>
                </SignInButton>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: appContent.stats.usersLabel,
                    value: appContent.stats.users,
                  },
                  {
                    label: appContent.stats.messagesLabel,
                    value: appContent.stats.messages,
                  },
                  {
                    label: appContent.stats.uptimeLabel,
                    value: appContent.stats.uptime,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-glass p-4 text-left shadow-[0_10px_60px_-40px_rgba(0,0,0,0.5)] ring-1 ring-border/60 dark:text-accent"
                  >
                    <div className="text-sm font-medium ">{item.label}</div>
                    <div className="mt-1 text-3xl font-bold ">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -right-6 bottom-4 h-28 w-28 rounded-full bg-secondary/25 blur-3xl" />

              <div className="relative mx-auto max-w-lg rounded-3xl bg-glass p-6 shadow-[0_25px_120px_-45px_rgba(0,0,0,0.6)] ring-1 ring-border/60 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-primary to-secondary p-4 text-white shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 rounded-full bg-white/20">
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Alex Rivera</div>
                      <div className="text-xs opacity-90">Design Lead</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                    Live
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-sm text-text-primary dark:bg-neutral-900">
                      Shipping the new chat composer today. Need your 👀 on the
                      gradients.
                      <div className="mt-2 text-xs text-text-muted">
                        2:34 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-linear-to-r from-primary to-secondary px-4 py-3 text-sm text-white shadow-lg">
                      Looks great—push it. Also adding status pills for live
                      rooms.
                      <div className="mt-2 text-xs text-white/80">2:35 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 text-xs font-medium text-text-muted">
                  <div className="rounded-xl bg-primary/10 px-3 py-2 text-primary">
                    Real-time
                  </div>
                  <div className="rounded-xl bg-secondary/10 px-3 py-2 text-secondary">
                    Presence
                  </div>
                  <div className="rounded-xl bg-accent/10 px-3 py-2 text-accent">
                    AI assist
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
