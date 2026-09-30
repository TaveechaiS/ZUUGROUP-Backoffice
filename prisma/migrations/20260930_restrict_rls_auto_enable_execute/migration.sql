-- Keep the event trigger, but do not expose its SECURITY DEFINER function
-- as a callable RPC to Data API roles. Some fresh databases do not have it.
DO $$
DECLARE
  api_role text;
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NULL THEN
    RETURN;
  END IF;

  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

  FOR api_role IN
    SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM %I', api_role);
  END LOOP;
END;
$$;
