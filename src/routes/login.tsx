import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginVal, setLoginVal] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginVal, password)) {
      navigate({ to: "/dashboard" });
    } else {
      setErr("Неверный логин или пароль");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border-2 border-dashed rounded-xl p-6 space-y-4 shadow-sm">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl shadow">
            📚
          </div>
          <h1 className="text-xl font-bold">ИС Расписание</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="login">Логин</Label>
          <Input id="login" value={loginVal} onChange={(e) => setLoginVal(e.target.value)} placeholder="login" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
        </div>
        {err && <div className="text-sm text-destructive">{err}</div>}
        <Button type="submit" className="w-full">Войти</Button>
      </form>
    </div>
  );
}
