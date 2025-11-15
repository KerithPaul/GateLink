const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Link {
  id: string;
  creatorWallet: string;
  contentType: "FILE" | "URL";
  contentPath: string | null;
  price: string;
  network: string;
  createdAt: string;
  totalEarnings?: string;
  paymentCount?: number;
}

export interface Payment {
  id: string;
  payerAddress: string;
  amount: string;
  txnId: string | null;
  txnGroupId: string | null;
  timestamp: string;
}

export interface LinkAnalytics {
  link: Link;
  stats: {
    totalEarnings: string;
    paymentCount: number;
    averagePayment: string;
  };
  payments: Payment[];
  chartData: Array<{
    date: string;
    amount: string;
  }>;
}

export interface CreateLinkRequest {
  wallet: string;
  price: string;
  contentType: "FILE" | "URL";
  url?: string;
  network?: string;
  file?: File;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

async function postFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export const api = {
  /**
   * Create a new payment link
   */
  async createLink(data: CreateLinkRequest): Promise<Link> {
    const formData = new FormData();
    formData.append("wallet", data.wallet);
    formData.append("price", data.price);
    formData.append("contentType", data.contentType);
    if (data.network) {
      formData.append("network", data.network);
    }
    if (data.contentType === "URL" && data.url) {
      formData.append("url", data.url);
    }
    if (data.contentType === "FILE" && data.file) {
      formData.append("file", data.file);
    }

    return postFormData<Link>("/api/links", formData);
  },

  /**
   * Get all links for a wallet address
   */
  async getLinks(wallet: string): Promise<Link[]> {
    return fetchApi<Link[]>(`/api/links?wallet=${encodeURIComponent(wallet)}`);
  },

  /**
   * Get a specific link by ID
   */
  async getLink(linkId: string): Promise<Link> {
    return fetchApi<Link>(`/api/links/${linkId}`);
  },

  /**
   * Get analytics for a specific link
   */
  async getLinkAnalytics(linkId: string): Promise<LinkAnalytics> {
    return fetchApi<LinkAnalytics>(`/api/links/${linkId}/analytics`);
  },

  /**
   * Get payments for a specific link
   */
  async getLinkPayments(linkId: string): Promise<Payment[]> {
    return fetchApi<Payment[]>(`/api/links/${linkId}/payments`);
  },
};

export { ApiError };

