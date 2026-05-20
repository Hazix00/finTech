import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import {
  AidCategory,
  AidRequest,
  AidRequestStatus,
  ListAidRequestsParams,
} from '../shared/models/aid-request.model';
import { AidRequestsStoreService } from '../services/aid-requests-store.service';

const DEFAULT_BENEFICIARY_ID = '11111111-1111-4111-8111-111111111111';

interface PageChangeEvent {
  first?: number;
  rows?: number;
}

interface AidRequestFormControls {
  category: FormControl<AidCategory | null>;
  amount: FormControl<number | null>;
  description: FormControl<string>;
}

@Component({
  selector: 'app-beneficiary',
  templateUrl: './beneficiary.component.html',
  styleUrls: ['../shared/styles/portal-shared.css', './beneficiary.component.css'],
})
export class BeneficiaryComponent implements OnInit, OnDestroy {
  readonly categoryOptions = [
    { label: 'HOUSING', value: AidCategory.HOUSING },
    { label: 'FOOD', value: AidCategory.FOOD },
    { label: 'HEALTH', value: AidCategory.HEALTH },
    { label: 'ENERGY', value: AidCategory.ENERGY },
    { label: 'OTHER', value: AidCategory.OTHER },
  ];
  readonly statusFilterOptions = [
    { label: 'All statuses', value: null },
    { label: 'PENDING', value: AidRequestStatus.PENDING },
    { label: 'UNDER_REVIEW', value: AidRequestStatus.UNDER_REVIEW },
    { label: 'APPROVED', value: AidRequestStatus.APPROVED },
    { label: 'REJECTED', value: AidRequestStatus.REJECTED },
  ];

  readonly beneficiaryId = DEFAULT_BENEFICIARY_ID;
  statusFilter: AidRequestStatus | null = null;

  page = 1;
  limit = 5;
  loading = false;
  submitting = false;
  activeAtLimit = false;

  readonly requestForm: FormGroup<AidRequestFormControls>;
  readonly myRequests$: Observable<AidRequest[]>;
  readonly totalRecords$: Observable<number>;

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly aidRequestsStoreService: AidRequestsStoreService,
    private readonly messageService: MessageService,
  ) {
    this.requestForm = this.fb.group<AidRequestFormControls>({
      category: this.fb.control<AidCategory | null>(null, Validators.required),
      amount: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(5000),
      ]),
      description: this.fb.nonNullable.control('', Validators.required),
    });

    this.myRequests$ = this.aidRequestsStoreService.beneficiaryRequests$;
    this.totalRecords$ = this.aidRequestsStoreService.beneficiaryTotal$;
  }

  ngOnInit(): void {
    this.fetchRequests();
    this.fetchActiveCount();
    this.subscriptions.add(
      this.aidRequestsStoreService.beneficiaryActiveCount$.subscribe(
        (count) => (this.activeAtLimit = count >= 2),
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  submitRequest(): void {
    if (this.requestForm.invalid) {
      return;
    }

    const { category, amount, description } = this.requestForm.getRawValue();

    if (!category || amount === null) {
      return;
    }

    this.submitting = true;
    this.subscriptions.add(
      this.aidRequestsStoreService
        .createAidRequest({
          beneficiaryId: this.beneficiaryId,
          category,
          amount,
          description: description.trim(),
        })
        .subscribe({
          next: () => {
            this.submitting = false;
            this.requestForm.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Request submitted',
              detail: 'Your aid request was sent successfully.',
            });
            this.fetchRequests();
            this.fetchActiveCount();
          },
          error: (error) => {
            this.submitting = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Submit failed',
              detail: this.extractErrorMessage(error),
            });
          },
        }),
    );
  }

  onApplyFilter(): void {
    this.page = 1;
    this.fetchRequests();
  }

  onPageChange(event: PageChangeEvent): void {
    this.page = Math.floor((event.first ?? 0) / (event.rows ?? this.limit)) + 1;
    this.limit = event.rows ?? this.limit;
    this.fetchRequests();
  }

  private fetchActiveCount(): void {
    this.subscriptions.add(
      this.aidRequestsStoreService.loadBeneficiaryActiveCount(this.beneficiaryId).subscribe(),
    );
  }

  private fetchRequests(): void {
    const query: ListAidRequestsParams = {
      beneficiaryId: this.beneficiaryId,
      status: this.statusFilter ?? undefined,
      page: this.page,
      limit: this.limit,
    };

    this.loading = true;
    this.subscriptions.add(
      this.aidRequestsStoreService.loadBeneficiaryRequests(query).subscribe({
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
