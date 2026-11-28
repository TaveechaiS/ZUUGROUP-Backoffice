SELECT
  u.employee_code,
  u.name,
  u.email,
  u.status,
  r.name AS role_name,
  u.team,
  u.deleted_at
FROM public.users AS u
LEFT JOIN public.user_roles AS ur ON ur.user_id = u.id
LEFT JOIN public.roles AS r ON r.id = ur.role_id
ORDER BY u.created_at DESC
LIMIT 50;
