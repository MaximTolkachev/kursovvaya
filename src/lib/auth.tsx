import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { store, seedIfNeeded, type User, type Role } from "./store";

interface DemoAccount {
  login: string;
  password: string;
  role: Role;
  name: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { login: "admin", password: "admin", role: "admin", name: "Администратор" },
  { login: "teacher", password: "teacher", role: "teacher", name: "Преподаватель" },
  { login: "student", password: "student", role: "student", name: "Студент" },
];

interface AuthCtx {
  user: User | null;
  login: (login: string, password: string) => boolean;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    seedIfNeeded();
    setUser(store.getUser());
  }, []);

  const login = (loginVal: string, password: string) => {
    const acc = DEMO_ACCOUNTS.find(
      (a) => a.login === loginVal.trim() && a.password === password
    );
    if (!acc) return false;
    const u: User = { login: acc.login, role: acc.role, name: acc.name };
    if (acc.role === "teacher") {
      const t = store.getTeachers()[0];
      if (t) { u.teacherId = t.id; u.name = t.fullName; }
    } else if (acc.role === "student") {
      const g = store.getGroups()[0];
      if (g) { u.groupId = g.id; u.name = `Студент (${g.name})`; }
    }
    store.setUser(u);
    setUser(u);
    return true;
  };

  const logout = () => {
    store.setUser(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
