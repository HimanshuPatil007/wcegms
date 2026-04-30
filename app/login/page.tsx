import { AuthForm } from "@/components/auth/auth-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthGuard redirectTo="/dashboard">
      <AuthShell
        description="Sign in to monitor fill level, gas level, weight, and mapped bin locations in real time."
        eyebrow="Firebase Auth"
        footerAction="Create an account"
        footerHref="/signup"
        footerLabel="Need access?"
        title="Secure access for your waste operations dashboard."
      >
        <AuthForm mode="login" />
      </AuthShell>
    </AuthGuard>
  );
}
