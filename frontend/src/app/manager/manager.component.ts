import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { AidRequest, AidRequestStatus, ListAidRequestsParams } from '../shared/models/aid-request.model';
import { AidRequestsStoreService } from '../services/aid-requests-store.service';

interface PageChangeEvent {
  first?: number;
  rows?: number;
}

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['../shared/styles/portal-shared.css', './manager.component.css'],
})
export class ManagerComponent implements OnInit, OnDestroy {
  readonly AidRequestStatus = AidRequestStatus;

  readonly statusOptions: Record<AidRequestStatus, string> = {
    [AidRequestStatus.PENDING]: 'PENDING',
    [AidRequestStatus.UNDER_REVIEW]: 'UNDER REVIEW',
    [AidRequestStatus.APPROVED]: 'APPROVED',
    [AidRequestStatus.REJECTED]: 'REJECTED',
  };
  readonly statusFilterOptions = [
    { label: 'All statuses', value: null },
    { label: 'PENDING', value: AidRequestStatus.PENDING },
    { label: 'UNDER REVIEW', value: AidRequestStatus.UNDER_REVIEW },
    { label: 'APPROVED', value: AidRequestStatus.APPROVED },
    { label: 'REJECTED', value: AidRequestStatus.REJECTED },
  ];

  statusFilter: AidRequestStatus | null = null;
  rowActionItems: MenuItem[] = [];
  page = 1;
  limit = 10;
  loading = false;

  readonly incomingRequests$: Observable<AidRequest[]>;
  readonly totalRecords$: Observable<number>;

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly aidRequestsStoreService: AidRequestsStoreService,
    private readonly messageService: MessageService,
  ) {
    this.incomingRequests$ = this.aidRequestsStoreService.managerRequests$;
    this.totalRecords$ = this.aidRequestsStoreService.managerTotal$;
  }

  ngOnInit(): void {
    this.fetchManagerRequests();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  hasActions(request: AidRequest): boolean {
    return request.status === AidRequestStatus.PENDING || request.status === AidRequestStatus.UNDER_REVIEW;
  }

  openActionsMenu(
    menu: { toggle: (event: MouseEvent) => void },
    event: MouseEvent,
    request: AidRequest,
  ): void {
    const items: MenuItem[] = [];

    if (request.status === AidRequestStatus.PENDING) {
      items.push({
        label: 'Mark as Under Review',
        icon: 'pi pi-eye',
        command: () => this.updateStatus(request.id, AidRequestStatus.UNDER_REVIEW),
      });
    }

    if (request.status === AidRequestStatus.UNDER_REVIEW) {
      items.push({
        label: 'Approve',
        icon: 'pi pi-check',
        command: () => this.updateStatus(request.id, AidRequestStatus.APPROVED),
      });
    }

    if (request.status === AidRequestStatus.PENDING || request.status === AidRequestStatus.UNDER_REVIEW) {
      items.push({
        label: 'Reject',
        icon: 'pi pi-times',
        command: () => this.updateStatus(request.id, AidRequestStatus.REJECTED),
      });
    }

    this.rowActionItems = items;
    menu.toggle(event);
  }

  updateStatus(requestId: string, status: AidRequestStatus): void {
    this.subscriptions.add(
      this.aidRequestsStoreService.updateAidRequestStatus(requestId, status).subscribe({
        next: (updatedRequest) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Status updated',
            detail: `Request ${updatedRequest.id} is now ${updatedRequest.status}.`,
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Update failed',
            detail: this.extractErrorMessage(error),
          });
        },
      }),
    );
  }

  onApplyFilter(): void {
    this.page = 1;
    this.fetchManagerRequests();
  }

  onPageChange(event: PageChangeEvent): void {
    this.page = Math.floor((event.first ?? 0) / (event.rows ?? this.limit)) + 1;
    this.limit = event.rows ?? this.limit;
    this.fetchManagerRequests();
  }

  private fetchManagerRequests(): void {
    const query: ListAidRequestsParams = {
      status: this.statusFilter ?? undefined,
      page: this.page,
      limit: this.limit,
    };

    this.loading = true;
    this.subscriptions.add(
      this.aidRequestsStoreService.loadManagerRequests(query).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Load failed',
            detail: this.extractErrorMessage(error),
          });
        },
      }),
    );
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const responseMessage = error.error?.message;
      if (Array.isArray(responseMessage) && responseMessage.length > 0) {
        return responseMessage.join(' ');
      }
      if (typeof responseMessage === 'string') {
        return responseMessage;
      }
      return error.message;
    }
    return 'Unexpected error.';
  }
}
