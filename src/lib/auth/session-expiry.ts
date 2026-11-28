export const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

export function sessionStartedAt(accessToken: string | undefined) {
  try {
    const payload = JSON.parse(
      atob((accessToken ?? '').split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { amr?: { method?: string; timestamp?: number }[] };
    const times = (payload.amr ?? [])
      .filter((entry) => entry.method === 'password')
      .map((entry) => entry.timestamp)
      .filter((value): value is number => typeof value === 'number');
    return times.length ? Math.max(...times) : null;
  } catch {
    return null;
  }
}

export function isSessionExpired(accessToken: string | undefined, now = Date.now()) {
  const startedAt = sessionStartedAt(accessToken);
  return startedAt === null || now / 1000 - startedAt >= SESSION_MAX_AGE_SECONDS;
}
