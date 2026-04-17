import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "director" | "teacher" | "staff";
export type AuthUser = { id: string; email: string; name: string; role: Role };

type StoredUser = AuthUser & { password: string };

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);
const USERS_KEY = "mektep.users";
const SESSION_KEY = "mektep.session";

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(u: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error("invalid");
    const u: AuthUser = { id: found.id, email: found.email, name: found.name, role: found.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signup = async (name: string, email: string, password: string, role: Role) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      // auto-login if same password, else error
      const f = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (f && f.password === password) {
        const u: AuthUser = { id: f.id, email: f.email, name: f.name, role: f.role };
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return;
      }
      throw new Error("exists");
    }
    const newUser: StoredUser = { id: crypto.randomUUID(), name, email, password, role };
    users.push(newUser);
    writeUsers(users);
    const u: AuthUser = { id: newUser.id, email, name, role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function hasOnboarded() {
  return localStorage.getItem("mektep.onboarded") === "1";
}
export function setOnboarded() {
  localStorage.setItem("mektep.onboarded", "1");
}
export function hasLanguage() {
  return !!localStorage.getItem("mektep.lang");
}
