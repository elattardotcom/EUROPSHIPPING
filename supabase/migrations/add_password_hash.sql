-- Run this once in your Supabase SQL editor
ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash TEXT;
