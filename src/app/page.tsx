import Link from "next/link";
import { ApplicationShell } from "@/components/application-shell";

export default function Home() {
  return (
    <ApplicationShell
      brand={
        <Link aria-label="ViewFinder home" className="wordmark" href="/">
          <span aria-hidden="true" className="brand-mark">
            <span />
          </span>
          <span>viewfinder</span>
        </Link>
      }
      controls={
        <Link className="quiet-button" href="/">
          Sign in
        </Link>
      }
    >
      <section className="scaffold-welcome">
        <p className="eyebrow">A little more outside</p>
        <h1>Find a place to feel somewhere.</h1>
        <p>Your next favorite view is waiting.</p>
      </section>
    </ApplicationShell>
  );
}
