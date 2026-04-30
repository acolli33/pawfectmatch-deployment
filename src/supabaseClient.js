
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://qolfsmymovrkdferadlc.supabase.co'
const supabaseKey = "supabaseKey"
export const supabase = createClient(supabaseUrl, supabaseKey)

// supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGZzbXltb3Zya2RmZXJhZGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTEwNjEsImV4cCI6MjA4NTQ4NzA2MX0.lBaDTP1Diln2XQ-KODgLREcTeKOOJIxmswDYDk_IMms'