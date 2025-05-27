const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dgkohzgisnqwhymnsriu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRna29oemdpc25xd2h5bW5zcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTI0MzgsImV4cCI6MjA2Mzc2ODQzOH0.3LESBnBTRHAzEyBd6b-KtWOGELqAyKVHBL79JvB2Emk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
