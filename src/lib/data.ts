import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "app", "_data", "db.json");

async function readDB() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeDB(data: any) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    const e: any = err;
    e.message = `Failed to write DB file: ${e.message}`;
    e.readonly = true;
    throw e;
  }
}

export async function getCollection(name: string) {
  const db = await readDB();
  return db[name] ?? [];
}

export async function findInCollection(
  name: string,
  predicate: (item: any) => boolean,
) {
  const col = await getCollection(name);
  return col.find(predicate);
}

export async function addToCollection(name: string, item: any) {
  const db = await readDB();
  db[name] = db[name] || [];
  db[name].push(item);
  await writeDB(db);
  return item;
}

export async function updateInCollection(name: string, id: string, patch: any) {
  const db = await readDB();
  db[name] = db[name] || [];
  const idx = db[name].findIndex((i: any) => String(i.id) === String(id));
  if (idx === -1) return null;
  db[name][idx] = { ...db[name][idx], ...patch };
  await writeDB(db);
  return db[name][idx];
}

export async function deleteFromCollection(name: string, id: string) {
  const db = await readDB();
  db[name] = db[name] || [];
  const idx = db[name].findIndex((i: any) => String(i.id) === String(id));
  if (idx === -1) return false;
  db[name].splice(idx, 1);
  await writeDB(db);
  return true;
}

export default {
  readDB,
  writeDB,
  getCollection,
  findInCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
};
