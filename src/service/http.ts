export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      throw new HttpError('คำขอไม่สำเร็จ กรุณาลองอีกครั้ง', response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new Error('เชื่อมต่อระบบไม่ได้ กรุณาตรวจเครือข่ายแล้วลองอีกครั้ง', { cause: error });
  }
}
