export type AdminCount = { label: string; count: number; amount?: string };
export type AdminNamed = { id: string | null; name: string; count: number; total: string };

export type AdminSummary = {
  range: { from: string; to: string; prevFrom: string; prevTo: string; unit: 'day' | 'month' };
  today: string;
  sales: {
    total: string;
    prevTotal: string;
    orders: number;
    prevOrders: number;
    orderStatuses: AdminCount[];
    quoteStatuses: AdminCount[];
    quotes: number;
    converted: number;
    trend: { period: string; total: string; orders: number }[];
    net: string;
    cost: string;
    giftCost: string;
    profit: string;
    gross: string;
    lineDiscount: string;
    billDiscount: string;
    giftQuantity: number;
    giftValue: string;
    customersBuying: number;
    newCustomers: number;
    repeatCustomers: number;
  };
  finance: {
    outstanding: string;
    overdue: string;
    overdueInvoices: number;
    aging: { current: string; d30: string; d60: string; d90: string; over90: string };
    issued: number;
    issuedAmount: string;
    received: string;
    payments: number;
    expenses: string;
    expenseCount: number;
    expensesByCategory: AdminCount[];
    uninvoiced: number;
    uninvoicedAmount: string;
    creditOver: number;
    creditNear: number;
    dso: number | null;
    avgDaysToPay: number | null;
    paidInvoices: number;
  };
  stock: {
    purchaseStatuses: AdminCount[];
    purchasesLate: number;
    purchasesInRange: number;
    purchasesAmount: string;
    stockValue: string;
    warehouses: { code: string; name: string; quantity: number }[];
    expiringLots: number;
    expiredLots: number;
    lowStock: number;
    outOfStock: number;
    countsOpen: number;
    countsClosed: number;
    countDiffLines: number;
    expiryDays: number;
    lowStockLevel: number;
    deadStock: number;
    deadStockValue: string;
    deadDays: number;
    receivedPurchases: number;
    lateReceipts: number;
    avgReceiptDelay: number | null;
  };
  customers: {
    total: number;
    statuses: AdminCount[];
    territories: AdminCount[];
    groups: AdminCount[];
    created: number;
    licenseExpired: number;
    licenseExpiring: number;
    requestsPending: number;
    followToday: number;
    followLate: number;
    followInRange: number;
    licenseWarningDays: number;
    quotesPending: number;
    quotesPendingAge: number | null;
    quotesExpiring: number;
    quoteExpiryDays: number;
  };
  products: {
    total: number;
    statuses: AdminCount[];
    categories: AdminCount[];
    promotionsActive: number;
    promotionsEnding: number;
    promotionQuotes: number;
    promotionOrders: number;
  };
  system: {
    users: number;
    roles: AdminCount[];
    statuses: AdminCount[];
    loggedInToday: number;
    inactive: number;
    auditEvents: number;
    inactiveDays: number;
  };
};

export type AdminSection = 'sales' | 'finance' | 'stock' | 'customers' | 'products' | 'system';

export type AdminDetails = {
  sales: {
    products: AdminNamed[];
    customers: AdminNamed[];
    sellers: AdminNamed[];
    territories: AdminNamed[];
    orders: {
      id: string;
      code: string;
      customerName: string;
      status: string;
      amount: string;
      createdAt: string;
    }[];
  };
  finance: {
    debtors: { id: string; name: string; outstanding: string; overdue: string; invoices: number }[];
    overdue: {
      id: string;
      code: string;
      customerName: string;
      dueDate: string;
      daysLate: number;
      outstanding: string;
    }[];
    payments: {
      id: string;
      invoiceId: string;
      invoiceCode: string;
      customerName: string;
      paidOn: string;
      method: string;
      amount: string;
    }[];
    expenses: {
      id: string;
      code: string;
      expenseDate: string;
      categoryName: string;
      payee: string;
      amount: string;
    }[];
    uninvoiced: { id: string; code: string; customerName: string; amount: string }[];
    credit: {
      id: string;
      name: string;
      creditLimit: string;
      outstanding: string;
      usage: number;
    }[];
  };
  stock: {
    purchases: {
      id: string;
      code: string;
      name: string;
      status: string;
      expectedOn: string | null;
      amount: string;
      late: boolean;
    }[];
    expiring: {
      id: string;
      productName: string;
      lotNumber: string;
      warehouseName: string;
      expiresOn: string;
      daysLeft: number;
      quantity: number;
    }[];
    lowStock: { id: string; code: string; name: string; unit: string; main: number }[];
    counts: {
      id: string;
      code: string;
      warehouseName: string;
      status: string;
      lines: number;
      counted: number;
      diffLines: number;
      createdAt: string;
    }[];
    dead: {
      id: string;
      code: string;
      name: string;
      unit: string;
      quantity: number;
      value: string;
      lastSoldOn: string | null;
    }[];
  };
  customers: {
    licenses: {
      id: string;
      code: string;
      name: string;
      licenseExpiresAt: string;
      daysLeft: number;
    }[];
    requests: { id: string; name: string; submittedBy: string; submittedAt: string }[];
    followUps: {
      id: string;
      code: string;
      customerName: string;
      nextOn: string;
      daysLate: number;
    }[];
    quotes: {
      id: string;
      code: string;
      customerName: string;
      status: string;
      validUntil: string | null;
      daysLeft: number | null;
      ageDays: number;
      amount: string;
    }[];
  };
  products: {
    promotions: {
      id: string;
      code: string;
      name: string;
      status: string;
      startsOn: string | null;
      endsOn: string | null;
      quotes: number;
      orders: number;
    }[];
  };
  system: {
    audit: { id: string; occurredAt: string; actorName: string; action: string }[];
    inactive: {
      id: string;
      employeeCode: string;
      name: string;
      roleName: string;
      lastLoginAt: string | null;
    }[];
  };
};

export type AdminSummaryResponse = { data: AdminSummary };
export type AdminDetailsResponse<S extends AdminSection = AdminSection> = {
  data: AdminDetails[S];
  section: S;
};
