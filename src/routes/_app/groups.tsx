import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { store, type Group } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/groups")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const u = store.getUser();
      if (u && u.role !== "admin") throw redirect({ to: "/dashboard" });
    }
  },
  component: GroupsPage,
});

const empty: Group = { id: "", name: "", course: 1, studentsCount: 0 };

function GroupsPage() {
  const [items, setItems] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Group>(empty);

  const reload = () => setItems(store.getGroups());
  useEffect(reload, []);

  const filtered = items.filter((g) => !search || g.name.toLowerCase().includes(search.toLowerCase()));

  const save = () => {
    if (!form.name.trim()) return;
    const list = store.getGroups();
    if (form.id) store.setGroups(list.map((x) => (x.id === form.id ? form : x)));
    else store.setGroups([...list, { ...form, id: store.uid() }]);
    setOpen(false); reload();
  };
  const del = (id: string) => {
    if (!confirm("Удалить?")) return;
    store.setGroups(store.getGroups().filter((x) => x.id !== id));
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Группы</h1>
          <p className="text-sm text-muted-foreground">Управление учебными группами</p>
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
              <TableHead>Название</TableHead>
              <TableHead>Курс</TableHead>
              <TableHead>Студентов</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Нет данных</TableCell></TableRow>
            ) : filtered.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>{g.course}</TableCell>
                <TableCell>{g.studentsCount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setForm(g); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(g.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Редактировать" : "Добавить"} группу</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Курс</Label><Input type="number" value={form.course} onChange={(e) => setForm({ ...form, course: Number(e.target.value) })} /></div>
            <div><Label>Количество студентов</Label><Input type="number" value={form.studentsCount} onChange={(e) => setForm({ ...form, studentsCount: Number(e.target.value) })} /></div>
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
