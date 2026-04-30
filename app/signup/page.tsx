import { AuthForm } from "@/components/auth/auth-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthGuard redirectTo="/dashboard">
      <AuthShell
        description="Create an operator account to access the live IoT garbage monitoring dashboard and future alert workflows."
        eyebrow="Firebase Auth"
        footerAction="Log in"
        footerHref="/login"
        footerLabel="Already have an account?"
        title="Create a dashboard account in a few seconds."
      >
        <AuthForm mode="signup" />
      </AuthShell>
    </AuthGuard>
  );
}
