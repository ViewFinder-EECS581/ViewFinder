"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "signup";

export function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/map");
  }

  return (
    <main className="login-shell">
      <aside className="login-aside" aria-label="ViewFinder introduction">
        <Link className="wordmark" href="/" aria-label="ViewFinder home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>viewfinder</span>
        </Link>

        <div className="login-story">
          <p className="eyebrow">A little more outside</p>
          <h1>
            Find a place
            <br />
            to <em>feel somewhere.</em>
          </h1>
          <p className="story-copy">
            Quiet corners, open skies, and the views worth taking the long way
            for.
          </p>
        </div>

        <div className="aside-bottom">
          <div className="avatar-stack" aria-hidden="true">
            <span>J</span>
            <span>M</span>
            <span>A</span>
          </div>
          <p>
            Made for the places
            <br />
            you want to remember.
          </p>
          <span className="aside-coordinate">38°56&apos;59&quot;N</span>
        </div>
      </aside>

      <section className="login-main">
        <header className="login-mobile-brand">
          <Link className="wordmark" href="/" aria-label="ViewFinder home">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span>viewfinder</span>
          </Link>
        </header>

        <div className="login-card">
          <div className="login-heading">
            <span className="eyebrow">Welcome to ViewFinder</span>
            <h2>
              {mode === "login" ? "Find your way back." : "Make it yours."}
            </h2>
            <p>
              {mode === "login"
                ? "Sign in to pick up where you left off."
                : "Create an account to save the places you find."}
            </p>
          </div>

          <div className="auth-tabs" aria-label="Account options">
            <button
              className={mode === "login" ? "auth-tab active" : "auth-tab"}
              type="button"
              aria-pressed={mode === "login"}
              onClick={() => {
                setMode("login");
              }}
            >
              Sign in
            </button>
            <button
              className={mode === "signup" ? "auth-tab active" : "auth-tab"}
              type="button"
              aria-pressed={mode === "signup"}
              onClick={() => {
                setMode("signup");
              }}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className="field">
                <span>Your name</span>
                <Input
                  autoComplete="name"
                  name="name"
                  placeholder="What should we call you?"
                  required
                />
              </label>
            )}
            <label className="field">
              <span>Email address</span>
              <Input
                autoComplete="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <Input
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                name="password"
                placeholder="At least 8 characters"
                required
                type="password"
              />
            </label>
            <Button className="auth-submit" type="submit">
              <span>{mode === "login" ? "Sign in" : "Create account"}</span>
              <span aria-hidden="true">↗</span>
            </Button>
          </form>

          <p className="preview-notice">
            Preview mode · Sign-in will be connected to your account next.
          </p>
          <div className="login-divider">
            <span />
            <span>or</span>
            <span />
          </div>
          <button
            className="text-button"
            onClick={() => router.push("/map")}
            type="button"
          >
            Explore the map first <span aria-hidden="true">→</span>
          </button>
        </div>

        <footer className="login-footer">
          <span>© 2026 ViewFinder</span>
          <span>For the love of getting lost.</span>
        </footer>
      </section>
    </main>
  );
}
