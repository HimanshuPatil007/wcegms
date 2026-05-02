"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useAuth } from "@/hooks/use-auth";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type FormState = {
  displayName: string;
  email: string;
  password: string;
};

const initialState: FormState = {
  displayName: "",
  email: "",
  password: "",
};

function FieldIcon({ path }: { path: string }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d={path} />
      </svg>
    </span>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { errorMessage, login, loginWithGoogle, signup } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "signup";
  const formError = localError ?? errorMessage;

  function updateField(field: keyof FormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function validateForm() {
    if (isSignup && form.displayName.trim().length < 2) {
      return "Display name must be at least 2 characters long.";
    }

    if (!form.email.includes("@")) {
      return "Enter a valid email address.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    setLocalError(validationError);

    if (validationError) {
      return;
    }

    startTransition(async () => {
      try {
        if (isSignup) {
          await signup({
            displayName: form.displayName,
            email: form.email,
            password: form.password,
          });
        } else {
          await login({
            email: form.email,
            password: form.password,
          });
        }

        router.replace("/dashboard");
      } catch {
        return;
      }
    });
  }

  function handleGoogleLogin() {
    setLocalError(null);

    startTransition(async () => {
      try {
        await loginWithGoogle();
        router.replace("/dashboard");
      } catch {
        return;
      }
    });
  }

  return (
    <form className="relative space-y-5" onSubmit={handleSubmit}>
      <div className="absolute right-0 top-0 rounded-[24px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_16px_30px_rgba(15,23,42,0.12)]">
        <Image
          alt="WCE GMS logo"
          className="h-14 w-14 rounded-[16px] object-cover sm:h-16 sm:w-16"
          height={2048}
          priority
          src="/wce-gms-icon.png"
          width={2048}
        />
      </div>
      <div>
        <h2 className="pr-20 text-center text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:pr-24 sm:text-[3.25rem]">
          {isSignup ? "Create Account" : "Hello Again!"}
        </h2>
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Auth Gateway
          </div>
        </div>
        <p className="mt-10 text-sm font-medium text-slate-700">
          {isSignup
            ? "Create your workspace account to access the dashboard"
            : "Sign in to continue monitoring the live campus network"}
        </p>
      </div>

      {isSignup ? (
        <label className="block space-y-2">
          <span className="sr-only">Display Name</span>
          <div className="relative">
            <FieldIcon path="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0" />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(45,212,191,0.12)]"
              name="displayName"
              placeholder="Display Name"
              value={form.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
            />
          </div>
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="sr-only">Email</span>
        <div className="relative">
          <FieldIcon path="M4 7h16v10H4z M4 8l8 6 8-6" />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(45,212,191,0.12)]"
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </div>
      </label>

      <label className="block space-y-2">
        <span className="sr-only">Password</span>
        <div className="relative">
          <FieldIcon path="M7 11V8a5 5 0 0 1 10 0v3 M6 11h12v9H6z" />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 pr-14 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(45,212,191,0.12)]"
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 transition hover:text-slate-700"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {!isSignup ? (
        <div className="text-right">
          <button
            className="text-sm font-medium text-slate-400 transition hover:text-slate-700"
            type="button"
          >
            Recovery Password
          </button>
        </div>
      ) : null}

      {formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {formError}
        </div>
      ) : null}

      <button
        className="mt-2 w-full rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-5 py-4 text-lg font-semibold text-white shadow-[0_18px_35px_rgba(15,118,110,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isPending}
        type="submit"
      >
        {isPending
          ? isSignup
            ? "Creating account..."
            : "Logging in..."
          : isSignup
            ? "Create Account"
            : "Sign In"}
      </button>

      {!isSignup ? (
        <div className="pt-6">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>Or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            disabled={isPending}
            onClick={handleGoogleLogin}
            type="button"
          >
            <span className="text-xl text-[#ea4335]">G</span>
            Continue with Google
          </button>
        </div>
      ) : null}
    </form>
  );
}
