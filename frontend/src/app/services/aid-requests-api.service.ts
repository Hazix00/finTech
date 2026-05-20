import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AidRequest,
  AidRequestStatus,
  CreateAidRequestPayload,
  ListAidRequestsParams,
  ListAidRequestsParamsKeys,
  ListAidRequestsResponse,
} from '../shared/models/aid-request.model';

@Injectable({
  providedIn: 'root',
})
export class AidRequestsApiService {
  private readonly baseUrl = `${environment.apiUrl}/aid-requests`;

  constructor(private readonly http: HttpClient) {}

  createAidRequest(payload: CreateAidRequestPayload): Observable<AidRequest> {
    return this.http.post<AidRequest>(this.baseUrl, payload);
  }

  listAidRequests(params: ListAidRequestsParams = {}): Observable<ListAidRequestsResponse> {
    let httpParams = new HttpParams();

    const paramsList = ['beneficiaryId', 'status', 'page', 'limit'];
    paramsList.forEach((param) => {
      if (params[param as ListAidRequestsParamsKeys]) {
        httpParams = httpParams.set(param, String(params[param as ListAidRequestsParamsKeys]));
      }
    });
    return this.http.get<ListAidRequestsResponse>(this.baseUrl, { params: httpParams });
  }

  updateAidRequestStatus(id: string, status: AidRequestStatus): Observable<AidRequest> {
    return this.http.patch<AidRequest>(`${this.baseUrl}/${id}/status`, { status });
  }
}
