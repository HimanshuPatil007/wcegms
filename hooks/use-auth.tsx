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
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { get, ref, set } from "firebase/database";

import { getFirebaseAuth, getRealtimeDatabase, isFirebaseConfigured } from "@/lib/firebase/config";
import { isBuiltInAdminEmail, type AccessRole } from "@/lib/app-user-access";
import { EMPLOYEE_PROFILES } from "@/lib/employee-profiles";

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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveDefaultAccessRole(email: string | null | undefined): AccessRole {
  if (isBuiltInAdminEmail(email)) {
    return "admin";
  }

  const matchingEmployee = EMPLOYEE_PROFILES.find(
    (employee) => employee.authEmail.toLowerCase() === email?.trim().toLowerCase(),
  );

  if (!matchingEmployee) {
    return "user";
  }

  return matchingEmployee.role === "Admin" ? "admin" : "employee";
}

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

  async function syncAuthenticatedUserRecord(nextUser: User) {
    const userRef = ref(getRealtimeDatabase(), `/appUsers/${nextUser.uid}`);
    const snapshot = await get(userRef);
    const existingUser = snapshot.exists()
      ? (snapshot.val() as {
          displayName?: string;
          email?: string;
          accessRole?: AccessRole;
          createdAt?: number;
        })
      : null;
    const email = nextUser.email ?? existingUser?.email ?? "";
    const defaultAccessRole = resolveDefaultAccessRole(email);

    await set(userRef, {
      uid: nextUser.uid,
      email,
      displayName:
        nextUser.displayName?.trim() ||
        existingUser?.displayName ||
        email.split("@")[0] ||
        "Operations User",
      accessRole: existingUser?.accessRole ?? defaultAccessRole,
      createdAt: existingUser?.createdAt ?? Date.now(),
      lastLoginAt: Date.now(),
    });
  }

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);

      if (nextUser) {
        void syncAuthenticatedUserRecord(nextUser);
      }
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

    await syncAuthenticatedUserRecord(credential.user);
  }

  async function login({ email, password }: AuthCredentials) {
    setRuntimeError(null);

    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      await syncAuthenticatedUserRecord(credential.user);
    } catch (error) {
      setRuntimeError(toReadableAuthError(error));
      throw error;
    }
  }

  async function logout() {
    setRuntimeError(null);
    await signOut(getFirebaseAuth());
  }

  async function loginWithGoogle() {
    setRuntimeError(null);

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(getFirebaseAuth(), provider);
      await syncAuthenticatedUserRecord(credential.user);
    } catch (error) {
      setRuntimeError(toReadableAuthError(error));
      throw error;
    }
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
    loginWithGoogle,
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
