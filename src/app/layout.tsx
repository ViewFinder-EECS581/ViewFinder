import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ViewFinder — Find your outside",
  description: "A thoughtful map for finding your next favorite view.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
