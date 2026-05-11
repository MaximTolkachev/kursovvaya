// Simple localStorage-backed data store for the diploma project.
export type Role = "admin" | "teacher" | "student";

export interface User {
  login: string;
  role: Role;
  name: string;
  // for teacher: teacherId; for student: groupId
  teacherId?: string;
  groupId?: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  department: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  course: number;
  studentsCount: number;
}

export interface Room {
  id: string;
  number: string;
  capacity: number;
  type: string;
}

export type LessonType = "Лекция" | "Практика" | "Лабораторная";

export interface Lesson {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  discipline: string;
  groupId: string;
  teacherId: string;
  roomId: string;
  type: LessonType;
}

const KEYS = {
  teachers: "is_teachers",
  groups: "is_groups",
  rooms: "is_rooms",
  lessons: "is_lessons",
  user: "is_user",
  seeded: "is_seeded_v1",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.seeded)) return;

  const teachers: Teacher[] = [
    { id: "t1", fullName: "Иванов Иван Иванович", department: "Кафедра ИТ", email: "ivanov@univ.ru" },
    { id: "t2", fullName: "Петрова Анна Сергеевна", department: "Кафедра математики", email: "petrova@univ.ru" },
    { id: "t3", fullName: "Сидоров Пётр Алексеевич", department: "Кафедра физики", email: "sidorov@univ.ru" },
  ];
  const groups: Group[] = [
    { id: "g1", name: "ИС-21", course: 3, studentsCount: 24 },
    { id: "g2", name: "ИС-22", course: 2, studentsCount: 26 },
    { id: "g3", name: "ПИ-21", course: 3, studentsCount: 22 },
  ];
  const rooms: Room[] = [
    { id: "r1", number: "101", capacity: 30, type: "Лекционная" },
    { id: "r2", number: "204", capacity: 20, type: "Компьютерный класс" },
    { id: "r3", number: "305", capacity: 25, type: "Лаборатория" },
  ];

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const day = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return fmt(d);
  };

  const lessons: Lesson[] = [
    { id: uid(), date: day(0), startTime: "09:00", endTime: "10:30", discipline: "Базы данных", groupId: "g1", teacherId: "t1", roomId: "r2", type: "Лекция" },
    { id: uid(), date: day(0), startTime: "10:45", endTime: "12:15", discipline: "Высшая математика", groupId: "g2", teacherId: "t2", roomId: "r1", type: "Практика" },
    { id: uid(), date: day(1), startTime: "13:00", endTime: "14:30", discipline: "Физика", groupId: "g3", teacherId: "t3", roomId: "r3", type: "Лабораторная" },
    { id: uid(), date: day(2), startTime: "09:00", endTime: "10:30", discipline: "Программирование", groupId: "g1", teacherId: "t1", roomId: "r2", type: "Лекция" },
    { id: uid(), date: day(3), startTime: "10:45", endTime: "12:15", discipline: "Базы данных", groupId: "g3", teacherId: "t1", roomId: "r2", type: "Практика" },
    { id: uid(), date: day(4), startTime: "13:00", endTime: "14:30", discipline: "Физика", groupId: "g2", teacherId: "t3", roomId: "r3", type: "Лекция" },
  ];

  write(KEYS.teachers, teachers);
  write(KEYS.groups, groups);
  write(KEYS.rooms, rooms);
  write(KEYS.lessons, lessons);
  localStorage.setItem(KEYS.seeded, "1");
}

export const store = {
  getTeachers: () => read<Teacher[]>(KEYS.teachers, []),
  setTeachers: (v: Teacher[]) => write(KEYS.teachers, v),
  getGroups: () => read<Group[]>(KEYS.groups, []),
  setGroups: (v: Group[]) => write(KEYS.groups, v),
  getRooms: () => read<Room[]>(KEYS.rooms, []),
  setRooms: (v: Room[]) => write(KEYS.rooms, v),
  getLessons: () => read<Lesson[]>(KEYS.lessons, []),
  setLessons: (v: Lesson[]) => write(KEYS.lessons, v),
  getUser: () => read<User | null>(KEYS.user, null),
  setUser: (u: User | null) => {
    if (u) write(KEYS.user, u);
    else if (typeof window !== "undefined") localStorage.removeItem(KEYS.user);
  },
  uid,
};
