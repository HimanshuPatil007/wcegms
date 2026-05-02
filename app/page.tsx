import { AuthForm } from "@/components/auth/auth-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthShell } from "@/components/auth/auth-shell";

export default function Home() {
  return (
    <AuthGuard redirectTo="/dashboard">
      <AuthShell
        description="Sign in to track live bin fill, gas, weight, and route activity from a cleaner, more focused campus operations dashboard."
        eyebrow="Campus Access"
        footerAction="Create an account"
        footerHref="/signup"
        footerLabel="Need access?"
        heroImageAlt="WCE GMS smart garbage collection system illustration"
        heroImageSrc="/wce-gms-icon.png"
        title="Smart waste operations start with one secure login."
      >
        <AuthForm mode="login" />
      </AuthShell>
    </AuthGuard>
  );
}
