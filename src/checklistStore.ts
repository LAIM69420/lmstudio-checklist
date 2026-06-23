import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface CheckItem {
  text: string;
  done: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: CheckItem[];
  createdAt: string;
}

interface DataFile {
  version: 1;
  checklists: Checklist[];
}

let nextId = 1;
let dataPath = "./.lmstudio-checklist.json";

export function setDataPath(p: string) {
  dataPath = path.resolve(p);
}

async function load(): Promise<Checklist[]> {
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(raw) as DataFile;
    if (parsed.version === 1 && Array.isArray(parsed.checklists)) {
      for (const c of parsed.checklists) {
        const idNum = parseInt(c.id, 10);
        if (!isNaN(idNum) && idNum >= nextId) nextId = idNum + 1;
      }
      return parsed.checklists;
    }
  } catch { /* init */ }
  return [];
}

async function save(checklists: Checklist[]): Promise<void> {
  const data: DataFile = { version: 1, checklists };
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function createChecklist(title: string): Promise<Checklist> {
  const lists = await load();
  const cl: Checklist = {
    id: String(nextId++),
    title,
    items: [],
    createdAt: new Date().toISOString(),
  };
  lists.push(cl);
  await save(lists);
  return cl;
}

export async function addItem(listId: string, text: string): Promise<boolean> {
  const lists = await load();
  const cl = lists.find((l) => l.id === listId);
  if (!cl) return false;
  cl.items.push({ text, done: false });
  await save(lists);
  return true;
}

export async function toggleItem(listId: string, itemIndex: number): Promise<string | null> {
  const lists = await load();
  const cl = lists.find((l) => l.id === listId);
  if (!cl) return "Checklist not found.";
  if (itemIndex < 0 || itemIndex >= cl.items.length) return "Item index out of range.";
  cl.items[itemIndex].done = !cl.items[itemIndex].done;
  await save(lists);
  return null;
}

export async function removeItem(listId: string, itemIndex: number): Promise<string | null> {
  const lists = await load();
  const cl = lists.find((l) => l.id === listId);
  if (!cl) return "Checklist not found.";
  if (itemIndex < 0 || itemIndex >= cl.items.length) return "Item index out of range.";
  cl.items.splice(itemIndex, 1);
  await save(lists);
  return null;
}

export async function listChecklists(): Promise<Checklist[]> {
  return await load();
}

export async function deleteChecklist(listId: string): Promise<boolean> {
  const lists = await load();
  const idx = lists.findIndex((l) => l.id === listId);
  if (idx === -1) return false;
  lists.splice(idx, 1);
  await save(lists);
  return true;
}
