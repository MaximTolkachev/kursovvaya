import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { store, type Lesson, type Teacher, type Group, type Room } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/reports")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const u = store.getUser();
      if (u && u.role !== "admin") throw redirect({ to: "/dashboard" });
    }
  },
  component: ReportsPage,
});

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function exportToExcel(filename: string, sheetName: string, rows: Record<string, string | number>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename);
}

function ReportsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selGroup, setSelGroup] = useState("");
  const [selTeacher, setSelTeacher] = useState("");

  useEffect(() => {
    setLessons(store.getLessons());
    setTeachers(store.getTeachers());
    setGroups(store.getGroups());
    setRooms(store.getRooms());
  }, []);

  const teacherName = (id: string) => teachers.find((t) => t.id === id)?.fullName ?? "—";
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? "—";
  const roomName = (id: string) => rooms.find((r) => r.id === id)?.number ?? "—";

  const byGroup = lessons.filter((l) => !selGroup || l.groupId === selGroup);
  const byTeacher = lessons.filter((l) => !selTeacher || l.teacherId === selTeacher);

  const ws = startOfWeek(new Date()); const we = new Date(ws); we.setDate(we.getDate() + 7);
  const weekLessons = lessons.filter((l) => {
    const d = new Date(l.date); return d >= ws && d < we;
  });
  const weekCount = weekLessons.length;

  const roomLoad = useMemo(() => {
    const map = new Map<string, number>();
    rooms.forEach((r) => map.set(r.id, 0));
    lessons.forEach((l) => map.set(l.roomId, (map.get(l.roomId) || 0) + 1));
    return rooms.map((r) => ({ room: r, count: map.get(r.id) || 0 })).sort((a, b) => b.count - a.count);
  }, [rooms, lessons]);

  const exportGroup = () => {
    const g = groups.find((x) => x.id === selGroup);
    if (!g) return;
    const rows = byGroup.map((l) => ({
      Дата: l.date,
      Время: `${l.startTime}–${l.endTime}`,
      Дисциплина: l.discipline,
      Тип: l.type,
      Преподаватель: teacherName(l.teacherId),
      Аудитория: roomName(l.roomId),
    }));
    exportToExcel(`Расписание_группа_${g.name}.xlsx`, `Группа ${g.name}`, rows);
  };

  const exportTeacher = () => {
    const t = teachers.find((x) => x.id === selTeacher);
    if (!t) return;
    const rows = byTeacher.map((l) => ({
      Дата: l.date,
      Время: `${l.startTime}–${l.endTime}`,
      Дисциплина: l.discipline,
      Тип: l.type,
      Группа: groupName(l.groupId),
      Аудитория: roomName(l.roomId),
    }));
    exportToExcel(`Расписание_преподаватель_${t.fullName}.xlsx`, "Преподаватель", rows);
  };

  const exportRoomLoad = () => {
    const rows = roomLoad.map(({ room, count }) => ({
      Аудитория: `№ ${room.number}`,
      Тип: room.type,
      Вместимость: room.capacity,
      "Количество занятий": count,
    }));
    exportToExcel("Загруженность_аудиторий.xlsx", "Аудитории", rows);
  };

  const exportWeek = () => {
    const rows = weekLessons.map((l) => ({
      Дата: l.date,
      Время: `${l.startTime}–${l.endTime}`,
      Дисциплина: l.discipline,
      Тип: l.type,
      Группа: groupName(l.groupId),
      Преподаватель: teacherName(l.teacherId),
      Аудитория: roomName(l.roomId),
    }));
    exportToExcel("Занятия_за_неделю.xlsx", "Неделя", rows);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Отчёты</h1>
        <p className="text-sm text-muted-foreground">Аналитика и сводные данные. Выгрузка только в Excel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Занятий за текущую неделю</div>
              <div className="text-3xl font-semibold mt-1">{weekCount}</div>
            </div>
            <Button variant="outline" size="sm" onClick={exportWeek} disabled={weekCount === 0}>
              <Download className="h-4 w-4 mr-1" /> Excel
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Всего занятий в системе</div>
            <div className="text-3xl font-semibold mt-1">{lessons.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Расписание по группе</CardTitle>
          <Button variant="outline" size="sm" onClick={exportGroup} disabled={!selGroup || byGroup.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs mb-4">
            <Label className="text-xs">Группа</Label>
            <Select value={selGroup} onValueChange={setSelGroup}>
              <SelectTrigger><SelectValue placeholder="Выберите группу" /></SelectTrigger>
              <SelectContent>{groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {selGroup && (
            <Table>
              <TableHeader><TableRow><TableHead>Дата</TableHead><TableHead>Время</TableHead><TableHead>Дисциплина</TableHead><TableHead>Преподаватель</TableHead><TableHead>Аудитория</TableHead></TableRow></TableHeader>
              <TableBody>
                {byGroup.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">Нет данных</TableCell></TableRow> :
                  byGroup.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.date}</TableCell>
                      <TableCell>{l.startTime}–{l.endTime}</TableCell>
                      <TableCell>{l.discipline}</TableCell>
                      <TableCell>{teacherName(l.teacherId)}</TableCell>
                      <TableCell>{roomName(l.roomId)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Расписание по преподавателю</CardTitle>
          <Button variant="outline" size="sm" onClick={exportTeacher} disabled={!selTeacher || byTeacher.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs mb-4">
            <Label className="text-xs">Преподаватель</Label>
            <Select value={selTeacher} onValueChange={setSelTeacher}>
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {selTeacher && (
            <Table>
              <TableHeader><TableRow><TableHead>Дата</TableHead><TableHead>Время</TableHead><TableHead>Дисциплина</TableHead><TableHead>Группа</TableHead><TableHead>Аудитория</TableHead></TableRow></TableHeader>
              <TableBody>
                {byTeacher.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">Нет данных</TableCell></TableRow> :
                  byTeacher.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.date}</TableCell>
                      <TableCell>{l.startTime}–{l.endTime}</TableCell>
                      <TableCell>{l.discipline}</TableCell>
                      <TableCell>{groupName(l.groupId)}</TableCell>
                      <TableCell>{roomName(l.roomId)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Загруженность аудиторий</CardTitle>
          <Button variant="outline" size="sm" onClick={exportRoomLoad} disabled={roomLoad.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Аудитория</TableHead><TableHead>Тип</TableHead><TableHead>Количество занятий</TableHead></TableRow></TableHeader>
            <TableBody>
              {roomLoad.map(({ room, count }) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">№ {room.number}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
