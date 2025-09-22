import { openDB } from "idb";

const dbPromise = openDB("learning-app-chat", 1, {
  upgrade(db) {
    db.createObjectStore("messages", { keyPath: "id" });
  },
});

export async function saveMessageLocal(message) {
  const db = await dbPromise;
  await db.put("messages", message);
}

export async function getLocalMessages() {
  const db = await dbPromise;
  return await db.getAll("messages");
}

export async function clearLocalMessages() {
  const db = await dbPromise;
  const tx = db.transaction("messages", "readwrite");
  await tx.store.clear();
  await tx.done;
}
