import { LoginScreen } from "@/features/auth/login-screen";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const { authError } = await searchParams;
  return <LoginScreen confirmationError={authError === "confirmation"} />;
}
