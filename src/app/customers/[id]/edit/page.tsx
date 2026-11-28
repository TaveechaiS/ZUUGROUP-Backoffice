'use client';

import { use, useEffect, useState } from 'react';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { Get, HttpError } from '@/service/http';
import type { CustomerDetailResponse } from '@/types/api/customers';
import CustomerForm from '../../create/customer-form';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  function retry() {
    setLoading(true);
    setError('');
    setMissing(false);
    setRefresh((v) => v + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    Get<CustomerDetailResponse>('/api/customers/' + encodeURIComponent(id), controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setCustomer(result.data);
      })
      .catch((e: Error) => {
        if (controller.signal.aborted) return;
        if (e instanceof HttpError && e.status === 404) setMissing(true);
        else setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, refresh]);

  if (loading)
    return (
      <section className="relative min-h-80 w-full">
        <LoadingComponent isVisible variant="content" label="กำลังโหลดข้อมูลลูกค้า..." />
      </section>
    );
  if (missing || (!customer && !error))
    return (
      <NotFoundComponent title="ไม่พบลูกค้า" onRefresh={retry} onBack={() => history.back()} />
    );
  if (error || !customer)
    return (
      <div role="alert" className="flex gap-3 p-6 text-sm poppins-regular text-red-600">
        {error}
        <button type="button" onClick={retry} className="text-[#1a58a7]">
          ลองใหม่
        </button>
      </div>
    );
  return <CustomerForm initial={customer} />;
}
