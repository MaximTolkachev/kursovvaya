import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Calendar, Users, Users2, DoorOpen, FileBarChart, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const items = [
  { to: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { to: "/schedule", label: "Расписание", icon: Calendar },
  { to: "/teachers", label: "Преподаватели", icon: Users, adminOnly: true },
  { to: "/groups", label: "Группы", icon: Users2, adminOnly: true },
  { to: "/rooms", label: "Аудитории", icon: DoorOpen, adminOnly: true },
  { to: "/reports", label: "Отчёты", icon: FileBarChart, adminOnly: true },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const visible = items.filter((i) => !i.adminOnly || user?.role === "admin");

  const roleLabel = user?.role === "admin" ? "Администратор" : user?.role === "teacher" ? "Преподаватель" : "Студент";

  return (
    <aside className="w-64 shrink-0 border-r-2 border-dashed bg-card flex flex-col">
      <div className="px-5 py-4 border-b-2 border-dashed flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg shadow-sm">
          📚
        </div>
        <div>
          <div className="font-bold text-foreground leading-tight">ИС Расписание</div>
          <div className="text-[11px] text-muted-foreground">студенческий помощник</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {visible.map((it) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-2 ${
                active
                  ? "bg-accent border-primary text-foreground font-semibold"
                  : "border-transparent text-foreground hover:bg-secondary hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t-2 border-dashed">
        <div className="px-3 py-2 text-xs">
          <div className="text-muted-foreground">{roleLabel}</div>
          <div className="font-medium truncate">{user?.name}</div>
        </div>
        <button
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Выход
        </button>
      </div>
    </aside>
  );
}
