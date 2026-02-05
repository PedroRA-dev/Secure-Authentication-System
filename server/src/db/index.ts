import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database.db');
export const db: Database.Database = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
