<!-- Load Supabase JS v2 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabaseUrl = "https://qcyqjcxzytjtsikzrdyv.supabase.co";  
  const supabaseKey = "YOUR_ANON_KEY";  

  // ✅ Correct initialization for CDN usage
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Export supabase globally so other scripts can use it
  window.supabaseClient = supabase;
</script>
