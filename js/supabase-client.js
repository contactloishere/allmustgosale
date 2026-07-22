// Connects the site to your Supabase project.
// The anon key is meant to be public/client-visible — real protection
// comes from the Row Level Security rules set up in supabase-schema.sql.

const SUPABASE_URL = "https://exgyfundyrvkeiyaqfjf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Z3lmdW5keXJ2a2VpeWFxZmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDQ2OTgsImV4cCI6MjEwMDI4MDY5OH0.cnp8KSjcY4_od8pFWeWqHYTPhA9fpize_iJzAoomXzY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
