// Client-side localStorage data helper
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

const DB_KEY = "contactAppDB";

function initDB() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seed = { contacts: [], users: [], posts: [] };
    localStorage.setItem(DB_KEY, JSON.stringify(seed));
  }
}

function readDB(): { contacts: Contact[]; users: User[]; posts: any[] } {
  if (typeof window === "undefined")
    return { contacts: [], users: [], posts: [] };
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY) || "{}");
}

function writeDB(db: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getContacts(userId?: string) {
  const db = readDB();
  return userId
    ? db.contacts.filter((c: any) => String(c.userId) === String(userId))
    : db.contacts;
}

export function addContact(payload: Partial<Contact>) {
  const db = readDB();
  const contact: Contact = {
    id: Date.now().toString(),
    name: payload.name || "",
    email: payload.email || "",
    phone: payload.phone || "",
    userId: payload.userId || "guest",
  };
  db.contacts.push(contact);
  writeDB(db);
  return contact;
}

export function updateContact(id: string, patch: Partial<Contact>) {
  const db = readDB();
  const idx = db.contacts.findIndex((c: any) => String(c.id) === String(id));
  if (idx === -1) return null;
  db.contacts[idx] = { ...db.contacts[idx], ...patch };
  writeDB(db);
  return db.contacts[idx];
}

export function deleteContact(id: string) {
  const db = readDB();
  const idx = db.contacts.findIndex((c: any) => String(c.id) === String(id));
  if (idx === -1) return false;
  db.contacts.splice(idx, 1);
  writeDB(db);
  return true;
}

export function getUsers() {
  const db = readDB();
  return db.users;
}

export function addUser(payload: Partial<User>) {
  const db = readDB();
  const user: User = {
    id: Date.now().toString(),
    name: payload.name || "",
    email: payload.email || "",
    password: payload.password || "",
  };
  db.users.push(user);
  writeDB(db);
  return user;
}

export function findUserByEmailAndPassword(email: string, password: string) {
  const db = readDB();
  return (
    db.users.find((u: any) => u.email === email && u.password === password) ||
    null
  );
}

export default {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getUsers,
  addUser,
  findUserByEmailAndPassword,
};
