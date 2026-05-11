import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { store, type Teacher } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/teachers")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const u = store.getUser();
      if (u && u.role !== "admin") throw redirect({ to: "/dashboard" });
    }
  },
  component: TeachersPage,
});

const empty: Teacher = { id: "", fullName: "", department: "", email: "" };

function TeachersPage() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Teacher>(empty);

  const reload = () => setItems(store.getTeachers());
  useEffect(reload, []);

  const filtered = items.filter((t) =>
    !search || t.fullName.toLowerCase().includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase())
  );

  const save = () => {
    if (!form.fullName.trim()) return;
    const list = store.getTeachers();
    if (form.id) store.setTeachers(list.map((x) => (x.id === form.id ? form : x)));
    else store.setTeachers([...list, { ...form, id: store.uid() }]);
    setOpen(false); reload();
  };
  const del = (id: string) => {
    if (!confirm("Удалить?")) return;
    store.setTeachers(store.getTeachers().filter((x) => x.id !== id));
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Преподаватели</h1>
          <p className="text-sm text-muted-foreground">Управление списком преподавателей</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Добавить</Button>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="bg-card border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Кафедра</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Нет данных</TableCell></TableRow>
            ) : filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.fullName}</TableCell>
                <TableCell>{t.department}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setForm(t); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Редактировать" : "Добавить"} преподавателя</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>ФИО</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>Кафедра</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
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
