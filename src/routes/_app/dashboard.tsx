import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Users, Users2, DoorOpen } from "lucide-react";
import { store, type Lesson, type Teacher, type Group, type Room } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function Dashboard() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    setTeachers(store.getTeachers());
    setGroups(store.getGroups());
    setRooms(store.getRooms());
    setLessons(store.getLessons());
  }, []);

  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);

  const visibleLessons = lessons.filter((l) => {
    if (user?.role === "teacher" && user.teacherId) return l.teacherId === user.teacherId;
    if (user?.role === "student" && user.groupId) return l.groupId === user.groupId;
    return true;
  });

  const weekLessons = visibleLessons.filter((l) => {
    const d = new Date(l.date);
    return d >= weekStart && d < weekEnd;
  });

  const now = new Date();
  const upcoming = [...visibleLessons]
    .filter((l) => new Date(`${l.date}T${l.startTime}`) >= now)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 5);

  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.fullName ?? "—";
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? "—";
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.number ?? "—";

  const cards = [
    { label: "Преподаватели", value: teachers.length, icon: Users },
    { label: "Группы", value: groups.length, icon: Users2 },
    { label: "Аудитории", value: rooms.length, icon: DoorOpen },
    { label: "Занятий на неделе", value: weekLessons.length, icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Главная</h1>
        <p className="text-sm text-muted-foreground">Добро пожаловать, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="text-2xl font-semibold">{c.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Ближайшие занятия</CardTitle>
          <Link to="/schedule" className="text-sm text-primary hover:underline">Все занятия →</Link>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-sm text-muted-foreground">Нет запланированных занятий</div>
          ) : (
            <div className="divide-y">
              {upcoming.map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{l.discipline}</div>
                    <div className="text-muted-foreground">
                      {l.date} • {l.startTime}–{l.endTime} • {l.type}
                    </div>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <div>Гр. {groupName(l.groupId)} • Ауд. {roomName(l.roomId)}</div>
                    <div>{teacherName(l.teacherId)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
