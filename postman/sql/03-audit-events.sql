SELECT
  a.occurred_at,
  a.action,
  a.actor_role,
  actor.employee_code AS actor_code,
  target.employee_code AS target_code,
  a.request_id
FROM public.audit_events AS a
LEFT JOIN public.users AS actor ON actor.id = a.actor_user_id
LEFT JOIN public.users AS target ON target.id = a.target_user_id
ORDER BY a.occurred_at DESC
LIMIT 50;
