import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "db.sqlite");
export const db = new Database(dbPath);

// Init tables
db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS presences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT NOT NULL,
  date TEXT NOT NULL,            -- format YYYY-MM-DD (heure locale)
  start_time TEXT NOT NULL,      -- HH:MM
  end_time TEXT NOT NULL         -- HH:MM
);

CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  presence_id INTEGER NOT NULL REFERENCES presences(id) ON DELETE CASCADE,
  start_at TEXT NOT NULL,        -- ISO string (local date + time)
  UNIQUE (presence_id, start_at)
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  comment TEXT,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
`);

export function withinSameDay(dateStr) {
  // helper if needed later
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export function createPresence({ location, date, start_time, end_time }) {
  const insertPresence = db.prepare(`
    INSERT INTO presences (location, date, start_time, end_time)
    VALUES (@location, @date, @start_time, @end_time)
  `);
  const info = insertPresence.run({ location, date, start_time, end_time });
  const presenceId = info.lastInsertRowid;

  // Generate 15-min slots from start_time to end_time (exclusive of end)
  const [sh, sm] = start_time.split(":").map(Number);
  const [eh, em] = end_time.split(":").map(Number);

  const startDate = new Date(`${date}T${start_time}:00`);
  const endDate = new Date(`${date}T${end_time}:00`);

  const insertSlot = db.prepare(`
    INSERT OR IGNORE INTO slots (presence_id, start_at) VALUES (?, ?)
  `);

  for (let t = new Date(startDate); t < endDate; t = new Date(t.getTime() + 15 * 60 * 1000)) {
    const iso = t.toISOString();
    insertSlot.run(presenceId, iso);
  }

  return presenceId;
}

export function listUpcomingSlots({ dateFilter = null, locationFilter = "" } = {}) {
  let where = "WHERE slots.start_at >= datetime('now')";
  const params = {};

  if (dateFilter) {
    // filter slots on that day (local)
    const start = new Date(`${dateFilter}T00:00:00`);
    const end = new Date(`${dateFilter}T23:59:59`);
    where += " AND slots.start_at BETWEEN @start AND @end";
    params.start = start.toISOString();
    params.end = end.toISOString();
  }
  if (locationFilter) {
    where += " AND presences.location LIKE @loc";
    params.loc = `%${locationFilter}%`;
  }

  const sql = `
    SELECT slots.id as slot_id, slots.start_at, presences.location, presences.date
    FROM slots
    JOIN presences ON presences.id = slots.presence_id
    ${where}
    ORDER BY presences.date ASC, presences.location ASC, slots.start_at ASC
  `;
  return db.prepare(sql).all(params);
}

export function getSlotById(slotId) {
  const sql = `
    SELECT slots.*, presences.location, presences.date
    FROM slots JOIN presences ON presences.id = slots.presence_id
    WHERE slots.id = ?
  `;
  return db.prepare(sql).get(slotId);
}

export function createReservation({ slot_id, first_name, last_name, phone, quantity, comment, token }) {
  const nowIso = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO reservations (slot_id, first_name, last_name, phone, quantity, comment, token, created_at)
    VALUES (@slot_id, @first_name, @last_name, @phone, @quantity, @comment, @token, @created_at)
  `);
  const info = stmt.run({ slot_id, first_name, last_name, phone, quantity, comment, token, created_at: nowIso });
  return info.lastInsertRowid;
}

export function getReservationByToken(token) {
  const sql = `
    SELECT r.*, s.start_at, p.location, p.date
    FROM reservations r
    JOIN slots s ON s.id = r.slot_id
    JOIN presences p ON p.id = s.presence_id
    WHERE r.token = ?
  `;
  return db.prepare(sql).get(token);
}

export function updateReservation(token, { first_name, last_name, phone, quantity, comment }) {
  const stmt = db.prepare(`
    UPDATE reservations
    SET first_name=@first_name, last_name=@last_name, phone=@phone, quantity=@quantity, comment=@comment
    WHERE token=@token
  `);
  stmt.run({ token, first_name, last_name, phone, quantity, comment });
}

export function deleteReservationByToken(token) {
  db.prepare(`DELETE FROM reservations WHERE token = ?`).run(token);
}

export function listReservations({ date = null, location = "" } = {}) {
  let where = "WHERE 1=1";
  const params = {};
  if (date) {
    where += " AND p.date = @date";
    params.date = date;
  }
  if (location) {
    where += " AND p.location LIKE @loc";
    params.loc = `%${location}%`;
  }
  const sql = `
    SELECT r.id, r.first_name, r.last_name, r.phone, r.quantity, r.comment, r.created_at,
           s.start_at, p.location, p.date
    FROM reservations r
    JOIN slots s ON s.id = r.slot_id
    JOIN presences p ON p.id = s.presence_id
    ${where}
    ORDER BY p.date ASC, s.start_at ASC
  `;
  return db.prepare(sql).all(params);
}

export function listPresences() {
  return db.prepare(`SELECT * FROM presences ORDER BY date ASC, start_time ASC`).all();
}