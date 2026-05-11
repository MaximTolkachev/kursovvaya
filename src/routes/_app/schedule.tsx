import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { store, type Lesson, type Teacher, type Group, type Room, type LessonType } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/schedule")({
  component: SchedulePage,
});

const empty: Lesson = {
  id: "", date: "", startTime: "", endTime: "",
  discipline: "", groupId: "", teacherId: "", roomId: "", type: "Лекция",
};

function SchedulePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [search, setSearch] = useState("");
  const [fDate, setFDate] = useState("");
  const [fGroup, setFGroup] = useState("all");
  const [fTeacher, setFTeacher] = useState("all");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Lesson>(empty);

  const reload = () => setLessons(store.getLessons());

  useEffect(() => {
    setTeachers(store.getTeachers());
    setGroups(store.getGroups());
    setRooms(store.getRooms());
    reload();
  }, []);

  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.fullName ?? "—";
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? "—";
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.number ?? "—";

  const filtered = useMemo(() => {
    let arr = lessons;
    if (user?.role === "teacher" && user.teacherId) arr = arr.filter((l) => l.teacherId === user.teacherId);
    if (user?.role === "student" && user.groupId) arr = arr.filter((l) => l.groupId === user.groupId);

    if (fDate) arr = arr.filter((l) => l.date === fDate);
    if (fGroup !== "all") arr = arr.filter((l) => l.groupId === fGroup);
    if (fTeacher !== "all") arr = arr.filter((l) => l.teacherId === fTeacher);
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter((l) =>
        l.discipline.toLowerCase().includes(s) ||
        teacherName(l.teacherId).toLowerCase().includes(s) ||
        groupName(l.groupId).toLowerCase().includes(s)
      );
    }
    return [...arr].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [lessons, search, fDate, fGroup, fTeacher, user, teachers, groups]);

  const openAdd = () => { setForm({ ...empty, id: "" }); setOpen(true); };
  const openEdit = (l: Lesson) => { setForm(l); setOpen(true); };

  const save = () => {
    if (!form.date || !form.startTime || !form.endTime || !form.discipline ||
        !form.groupId || !form.teacherId || !form.roomId) return;
    const list = store.getLessons();
    if (form.id) {
      store.setLessons(list.map((x) => (x.id === form.id ? form : x)));
    } else {
      store.setLessons([...list, { ...form, id: store.uid() }]);
    }
    setOpen(false);
    reload();
  };

  const del = (id: string) => {
    if (!confirm("Удалить занятие?")) return;
    store.setLessons(store.getLessons().filter((l) => l.id !== id));
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Расписание</h1>
          <p className="text-sm text-muted-foreground">Просмотр и управление занятиями</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Добавить</Button>
        )}
      </div>

      <div className="bg-card border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Поиск</Label>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Дисциплина, преподаватель..." />
        </div>
        <div>
          <Label className="text-xs">Дата</Label>
          <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Группа</Label>
          <Select value={fGroup} onValueChange={setFGroup}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Преподаватель</Label>
          <Select value={fTeacher} onValueChange={setFTeacher}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Начало</TableHead>
              <TableHead>Конец</TableHead>
              <TableHead>Дисциплина</TableHead>
              <TableHead>Группа</TableHead>
              <TableHead>Преподаватель</TableHead>
              <TableHead>Аудитория</TableHead>
              <TableHead>Тип</TableHead>
              {isAdmin && <TableHead className="text-right">Действия</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 9 : 8} className="text-center text-muted-foreground py-8">Нет данных</TableCell></TableRow>
            ) : filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.date}</TableCell>
                <TableCell>{l.startTime}</TableCell>
                <TableCell>{l.endTime}</TableCell>
                <TableCell className="font-medium">{l.discipline}</TableCell>
                <TableCell>{groupName(l.groupId)}</TableCell>
                <TableCell>{teacherName(l.teacherId)}</TableCell>
                <TableCell>{roomName(l.roomId)}</TableCell>
                <TableCell>{l.type}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(l.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{form.id ? "Редактировать занятие" : "Добавить занятие"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Дисциплина</Label><Input value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} /></div>
            <div><Label>Дата</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as LessonType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Лекция">Лекция</SelectItem>
                  <SelectItem value="Практика">Практика</SelectItem>
                  <SelectItem value="Лабораторная">Лабораторная</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Начало</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
            <div><Label>Конец</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            <div><Label>Группа</Label>
              <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Преподаватель</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Аудитория</Label>
              <Select value={form.roomId} onValueChange={(v) => setForm({ ...form, roomId: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{rooms.map((r) => <SelectItem key={r.id} value={r.id}>№{r.number} ({r.type})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={save}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
