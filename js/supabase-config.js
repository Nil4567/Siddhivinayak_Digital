<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabaseUrl = "https://qcyqjcxzytjtsikzrdyv.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeXFqY3h6eXRqdHNpa3pyZHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzA4NjAsImV4cCI6MjA4MDgwNjg2MH0.q0gkhSgqT_BNfsZBCd2stkgskf2V-CDVIG9p6S5LHdM";

  // ✅ Create client and expose globally
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
</script>
