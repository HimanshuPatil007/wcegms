import { AuthForm } from "@/components/auth/auth-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthGuard redirectTo="/dashboard">
      <AuthShell
        description=""
        eyebrow=""
        footerAction="Create an account"
        footerHref="/signup"
        footerLabel="Need access?"
        heroImageAlt="WCE GMS smart garbage collection system illustration"
        heroImageSrc="/wce-gms-icon.png"
        title=""
      >
        <AuthForm mode="login" />
      </AuthShell>
    </AuthGuard>
  );
}
