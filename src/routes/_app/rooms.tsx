import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { store, type Room } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/rooms")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const u = store.getUser();
      if (u && u.role !== "admin") throw redirect({ to: "/dashboard" });
    }
  },
  component: RoomsPage,
});

const empty: Room = { id: "", number: "", capacity: 0, type: "Лекционная" };

function RoomsPage() {
  const [items, setItems] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Room>(empty);

  const reload = () => setItems(store.getRooms());
  useEffect(reload, []);

  const filtered = items.filter((r) => !search || r.number.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));

  const save = () => {
    if (!form.number.trim()) return;
    const list = store.getRooms();
    if (form.id) store.setRooms(list.map((x) => (x.id === form.id ? form : x)));
    else store.setRooms([...list, { ...form, id: store.uid() }]);
    setOpen(false); reload();
  };
  const del = (id: string) => {
    if (!confirm("Удалить?")) return;
    store.setRooms(store.getRooms().filter((x) => x.id !== id));
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Аудитории</h1>
          <p className="text-sm text-muted-foreground">Управление списком аудиторий</p>
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
              <TableHead>Номер</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Вместимость</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Нет данных</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">№ {r.number}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.capacity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setForm(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Редактировать" : "Добавить"} аудиторию</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Номер</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
            <div><Label>Тип</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
            <div><Label>Вместимость</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
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
