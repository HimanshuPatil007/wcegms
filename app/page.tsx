import { AuthForm } from "@/components/auth/auth-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthShell } from "@/components/auth/auth-shell";

export default function Home() {
  return (
    <AuthGuard redirectTo="/dashboard">
      <AuthShell
        description=""
        eyebrow=""
        footerAction="Create an account"
        footerHref="/signup"
        footerLabel="Need access?"
        title=""
      >
        <AuthForm mode="login" />
      </AuthShell>
    </AuthGuard>
  );
}
