// src/db/indexedDB.js
import { openDB } from "idb";

const DB_NAME = "gamedo-offline";
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("progress")) {
      // store progress per book/chapter: key = `${bookId}::${chapterIndex}`
      db.createObjectStore("progress", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("chat")) {
      // auto increment id
      db.createObjectStore("chat", { keyPath: "id", autoIncrement: true });
    }
  },
});

export async function saveBook(book) {
  const db = await dbPromise;
  await db.put("books", book);
}

export async function getBook(id) {
  const db = await dbPromise;
  return db.get("books", id);
}

export async function getAllBooks() {
  const db = await dbPromise;
  return db.getAll("books");
}

export async function deleteAllBooks() {
  const db = await dbPromise;
  const tx = db.transaction("books", "readwrite");
  await tx.store.clear();
  await tx.done;
}

export async function setProgress(bookId, chapterIndex, completed = true) {
  const db = await dbPromise;
  const key = `${bookId}::${chapterIndex}`;
  await db.put("progress", {
    id: key,
    bookId,
    chapterIndex,
    completed,
    timestamp: Date.now(),
  });
}

export async function getProgress(bookId, chapterIndex) {
  const db = await dbPromise;
  const key = `${bookId}::${chapterIndex}`;
  return db.get("progress", key);
}

export async function getAllProgressForBook(bookId) {
  const db = await dbPromise;
  const all = await db.getAll("progress");
  return all.filter((p) => p.bookId === bookId);
}

/* Chat */
export async function saveMessage(message) {
  const db = await dbPromise;
  await db.add("chat", message);
}

export async function getMessages() {
  const db = await dbPromise;
  return db.getAll("chat");
}

export async function clearMessages() {
  const db = await dbPromise;
  const tx = db.transaction("chat", "readwrite");
  await tx.store.clear();
  await tx.done;
}
