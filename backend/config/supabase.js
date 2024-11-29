const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jqgdvfxtoijpkrcrbknn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZ2R2Znh0b2lqcGtyY3Jia25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MjYyNTEsImV4cCI6MjA0ODAwMjI1MX0.INe9XNxOwbocuct19KTYdfNZLG9e1jD2HDQUrXMS0zM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
