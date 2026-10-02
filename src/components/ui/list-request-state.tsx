'use client';
import LoadingComponent from './loading-component';
export default function ListRequestState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  return (
    <>
      <LoadingComponent isVisible={loading} />
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
