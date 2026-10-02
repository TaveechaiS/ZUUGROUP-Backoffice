'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { Masters, ProductView } from '@/types/api/products';
import type { UserRow } from '@/types/api/users';
type RouteData = {
  actorId?: string;
  isAdmin?: boolean;
  masters?: Masters;
  product?: ProductView;
  user?: UserRow;
};
const Context = createContext<RouteData>({});
export function RouteDataProvider({ data, children }: { data: RouteData; children: ReactNode }) {
  return <Context.Provider value={data}>{children}</Context.Provider>;
}
export function useRouteData() {
  return useContext(Context);
}
