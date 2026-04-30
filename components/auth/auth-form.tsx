"use client";
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
  const [showPassword, setShowPassword] = useState(false);

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
        <h2 className="text-center text-5xl font-semibold tracking-[-0.04em] text-slate-950">
          {isSignup ? "Create Account" : "Hello Again!"}
        </h2>
        <p className="mt-16 text-sm font-medium text-slate-800">
          {isSignup
            ? "Create your workspace account to access the dashboard"
            : "Let’s get started with your 30 days trial"}
        </p>
      </div>

      {isSignup ? (
        <label className="block space-y-2">
          <span className="sr-only">Display Name</span>
          <input
            className="w-full rounded-2xl border border-white bg-white px-5 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ba8a95] focus:shadow-[0_0_0_4px_rgba(186,138,149,0.12)]"
            name="displayName"
            placeholder="Display Name"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="sr-only">Email</span>
        <input
          className="w-full rounded-2xl border border-white bg-white px-5 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ba8a95] focus:shadow-[0_0_0_4px_rgba(186,138,149,0.12)]"
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="sr-only">Password</span>
        <div className="relative">
          <input
            className="w-full rounded-2xl border border-white bg-white px-5 py-4 pr-14 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ba8a95] focus:shadow-[0_0_0_4px_rgba(186,138,149,0.12)]"
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition hover:text-slate-700"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            type="button"
          >
            {showPassword ? "◉" : "◌"}
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
        className="mt-2 w-full rounded-2xl bg-[#a77482] px-5 py-4 text-lg font-semibold text-white shadow-[0_18px_35px_rgba(167,116,130,0.28)] transition hover:bg-[#956573] disabled:cursor-not-allowed disabled:bg-slate-400"
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

          <div className="mt-8 flex items-center justify-center gap-8">
            {[
              { label: "Google", mark: "G" },
              { label: "Apple", mark: "" },
              { label: "Facebook", mark: "f" },
            ].map((provider) => (
              <button
                key={provider.label}
                aria-label={`Continue with ${provider.label}`}
                className={`flex h-14 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white text-3xl text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  provider.label === "Apple" ? "shadow-[0_10px_24px_rgba(15,23,42,0.16)]" : ""
                }`}
                type="button"
              >
                {provider.mark}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
