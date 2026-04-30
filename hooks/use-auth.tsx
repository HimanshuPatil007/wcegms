"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/config";

type AuthCredentials = {
  email: string;
  password: string;
};

type SignupCredentials = AuthCredentials & {
  displayName: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  errorMessage: string | null;
  signup: (credentials: SignupCredentials) => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toReadableAuthError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code
      .replace("auth/", "")
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return "Authentication request failed";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isConfigured = isFirebaseConfigured();
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const errorMessage = !isConfigured
    ? "Firebase environment variables are missing. Add them before using authentication."
    : runtimeError;

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isConfigured]);

  async function signup({ displayName, email, password }: SignupCredentials) {
    setRuntimeError(null);

    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );

    if (displayName.trim()) {
      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });
      setUser(getFirebaseAuth().currentUser);
    }
  }

  async function login({ email, password }: AuthCredentials) {
    setRuntimeError(null);

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (error) {
      setRuntimeError(toReadableAuthError(error));
      throw error;
    }
  }

  async function logout() {
    setRuntimeError(null);
    await signOut(getFirebaseAuth());
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    isConfigured,
    errorMessage,
    signup: async (credentials) => {
      try {
        await signup(credentials);
      } catch (error) {
        setRuntimeError(toReadableAuthError(error));
        throw error;
      }
    },
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
