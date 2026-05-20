export enum AidCategory {
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  ENERGY = 'ENERGY',
  OTHER = 'OTHER',
}

export enum AidRequestStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface AidRequest {
  id: string;
  beneficiaryId: string;
  category: AidCategory;
  amount: string;
  description: string;
  status: AidRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAidRequestPayload {
  beneficiaryId: string;
  category: AidCategory;
  amount: number;
  description: string;
}

export interface ListAidRequestsParams {
  beneficiaryId?: string;
  status?: AidRequestStatus;
  page?: number;
  limit?: number;
}

export type ListAidRequestsParamsKeys = keyof ListAidRequestsParams;

export interface ListAidRequestsResponse {
  items: AidRequest[];
  total: number;
  page: number;
  limit: number;
}
