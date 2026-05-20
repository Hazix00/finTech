import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, tap } from 'rxjs';
import {
  AidRequest,
  AidRequestStatus,
  CreateAidRequestPayload,
  ListAidRequestsParams,
  ListAidRequestsResponse,
} from '../shared/models/aid-request.model';
import { AidRequestsApiService } from './aid-requests-api.service';

@Injectable({
  providedIn: 'root',
})
export class AidRequestsStoreService {
  private readonly beneficiaryRequestsSubject = new BehaviorSubject<AidRequest[]>([]);
  readonly beneficiaryRequests$ = this.beneficiaryRequestsSubject.asObservable();

  private readonly managerRequestsSubject = new BehaviorSubject<AidRequest[]>([]);
  readonly managerRequests$ = this.managerRequestsSubject.asObservable();

  private readonly beneficiaryTotalSubject = new BehaviorSubject<number>(0);
  readonly beneficiaryTotal$ = this.beneficiaryTotalSubject.asObservable();

  private readonly managerTotalSubject = new BehaviorSubject<number>(0);
  readonly managerTotal$ = this.managerTotalSubject.asObservable();

  private readonly beneficiaryActiveCountSubject = new BehaviorSubject<number>(0);
  readonly beneficiaryActiveCount$ = this.beneficiaryActiveCountSubject.asObservable();

  private beneficiaryQuery: ListAidRequestsParams = {};
  private managerQuery: ListAidRequestsParams = {};

  constructor(private readonly aidRequestsApiService: AidRequestsApiService) {}

  loadBeneficiaryRequests(query: ListAidRequestsParams): Observable<ListAidRequestsResponse> {
    this.beneficiaryQuery = { ...query };
    return this.aidRequestsApiService.listAidRequests(query).pipe(
      tap((response) => {
        this.beneficiaryRequestsSubject.next(response.items);
        this.beneficiaryTotalSubject.next(response.total);
      }),
    );
  }

  loadManagerRequests(query: ListAidRequestsParams): Observable<ListAidRequestsResponse> {
    this.managerQuery = { ...query };
    return this.aidRequestsApiService.listAidRequests(query).pipe(
      tap((response) => {
        this.managerRequestsSubject.next(response.items);
        this.managerTotalSubject.next(response.total);
      }),
    );
  }

  loadBeneficiaryActiveCount(beneficiaryId: string): Observable<number> {
    return forkJoin([
      this.aidRequestsApiService.listAidRequests({ beneficiaryId, status: AidRequestStatus.PENDING, limit: 1, page: 1 }),
      this.aidRequestsApiService.listAidRequests({ beneficiaryId, status: AidRequestStatus.UNDER_REVIEW, limit: 1, page: 1 }),
    ]).pipe(
      map(([pendingRes, underReviewRes]) => pendingRes.total + underReviewRes.total),
      tap((count) => this.beneficiaryActiveCountSubject.next(count)),
    );
  }

  createAidRequest(payload: CreateAidRequestPayload): Observable<AidRequest> {
    return this.aidRequestsApiService.createAidRequest(payload).pipe(
      tap((createdRequest) => {
        if (this.beneficiaryQuery.beneficiaryId === createdRequest.beneficiaryId) {
          this.beneficiaryRequestsSubject.next([
            createdRequest,
            ...this.beneficiaryRequestsSubject.value,
          ]);
          this.beneficiaryTotalSubject.next(this.beneficiaryTotalSubject.value + 1);
        }
      }),
    );
  }

  updateAidRequestStatus(id: string, status: AidRequestStatus): Observable<AidRequest> {
    return this.aidRequestsApiService.updateAidRequestStatus(id, status).pipe(
      tap((updatedRequest) => {
        this.managerRequestsSubject.next(
          this.managerRequestsSubject.value.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request,
          ),
        );
        this.beneficiaryRequestsSubject.next(
          this.beneficiaryRequestsSubject.value.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request,
          ),
        );
      }),
    );
  }
}
