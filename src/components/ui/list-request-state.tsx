'use client';
export default function ListRequestState({ error, retry }: { error: string; retry: () => void }) {
  return (
    <>
      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
          <button type="button" onClick={retry} className="ml-3 underline">
            ลองใหม่
          </button>
        </div>
      )}
    </>
  );
}
