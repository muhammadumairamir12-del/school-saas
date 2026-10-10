import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { DEMO_PACK } from './mockData';

const LS_PREFIX = 'sky-demo:';

export function readLocalCollection(name) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + name);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeLocalCollection(name, rows) {
  localStorage.setItem(LS_PREFIX + name, JSON.stringify(rows));
}

export function upsertLocal(name, row) {
  const list = readLocalCollection(name) || [];
  const idx = list.findIndex((r) => r.id === row.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...row };
  else list.push(row);
  writeLocalCollection(name, list);
  return list;
}

export function removeLocal(name, id) {
  const list = (readLocalCollection(name) || []).filter((r) => r.id !== id);
  writeLocalCollection(name, list);
  return list;
}

/** Write every demo pack collection into Firestore + localStorage */
export async function loadFullDemoData() {
  const entries = Object.entries(DEMO_PACK);
  for (const [name, rows] of entries) {
    writeLocalCollection(name, rows);
    try {
      const batch = writeBatch(db);
      let count = 0;
      for (const row of rows) {
        batch.set(doc(db, name, row.id), row, { merge: true });
        count += 1;
        if (count % 400 === 0) await batch.commit();
      }
      await batch.commit();
    } catch (err) {
      console.warn(`Demo seed for ${name} used local storage only`, err);
    }
  }
  localStorage.setItem('sky-demo-loaded', '1');
  return DEMO_PACK;
}

export async function ensureDemoSeeded() {
  if (localStorage.getItem('sky-demo-loaded') === '1') return;
  try {
    const snap = await getDocs(collection(db, 'students'));
    if (snap.empty || snap.size < 8) {
      await loadFullDemoData();
    } else {
      // Mirror existing sparse packs into local for offline edit
      for (const [name, rows] of Object.entries(DEMO_PACK)) {
        if (!readLocalCollection(name)) writeLocalCollection(name, rows);
      }
      localStorage.setItem('sky-demo-loaded', '1');
    }
  } catch {
    await loadFullDemoData();
  }
}
