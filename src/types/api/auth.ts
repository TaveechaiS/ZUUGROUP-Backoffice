export type LoginRequest = { email: string; password: string };
export type LoginFailure = {
  ok: false;
  status: number;
  code: 'required' | 'config' | 'invalid' | 'inactive' | 'temporary';
  error: string;
};
export type LoginResult =
  | LoginFailure
  | {
      ok: true;
      user: { id: string; name: string; employeeCode: string; roleId: string };
      accessToken: string;
      tokenType: 'Bearer';
      expiresIn: number;
    };

/** The login route returns { error } on failure, not the internal failure result. */
export type LoginResponse = Extract<LoginResult, { ok: true }>;
