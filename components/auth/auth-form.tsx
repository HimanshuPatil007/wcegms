"use client";

import Link from "next/link";
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

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { errorMessage, login, signup } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          {isSignup ? "Create account" : "Welcome back"}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {isSignup ? "Sign up for the dashboard" : "Log in to continue"}
        </h2>
      </div>

      {isSignup ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Display Name</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
            name="displayName"
            placeholder="Operations Admin"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
          name="email"
          placeholder="admin@example.com"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
          name="password"
          placeholder="Minimum 6 characters"
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
        />
      </label>

      {formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {formError}
        </div>
      ) : null}

      <button
        className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isPending}
        type="submit"
      >
        {isPending
          ? isSignup
            ? "Creating account..."
            : "Logging in..."
          : isSignup
            ? "Create account"
            : "Log in"}
      </button>

      <Link
        className="block text-center text-sm font-medium text-slate-500 transition hover:text-slate-900"
        href="/"
      >
        Return to project overview
      </Link>
    </form>
  );
}
