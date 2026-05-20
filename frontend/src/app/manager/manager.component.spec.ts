import '@angular/compiler';
import { BehaviorSubject, of } from 'rxjs';
import { AidCategory, AidRequest, AidRequestStatus } from '../shared/models/aid-request.model';
import { ManagerComponent } from './manager.component';

function makeAidRequest(status: AidRequestStatus): AidRequest {
  return {
    id: 'req-001',
    beneficiaryId: 'ben-001',
    category: AidCategory.HOUSING,
    amount: '500',
    description: 'Need housing aid',
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeStoreService() {
  return {
    managerRequests$: new BehaviorSubject<AidRequest[]>([]).asObservable(),
    managerTotal$: new BehaviorSubject<number>(0).asObservable(),
    loadManagerRequests: jest
      .fn()
      .mockReturnValue(of({ items: [], total: 0, page: 1, limit: 10 })),
    updateAidRequestStatus: jest.fn(),
  };
}

describe('ManagerComponent', () => {
  let component: ManagerComponent;
  let storeService: ReturnType<typeof makeStoreService>;
  let messageService: { add: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    storeService = makeStoreService();
    messageService = { add: jest.fn() };
    component = new ManagerComponent(storeService as any, messageService as any);
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  describe('hasActions', () => {
    it('returns true for a PENDING request', () => {
      expect(component.hasActions(makeAidRequest(AidRequestStatus.PENDING))).toBe(true);
    });

    it('returns true for an UNDER_REVIEW request', () => {
      expect(component.hasActions(makeAidRequest(AidRequestStatus.UNDER_REVIEW))).toBe(true);
    });

    it('returns false for an APPROVED request', () => {
      expect(component.hasActions(makeAidRequest(AidRequestStatus.APPROVED))).toBe(false);
    });

    it('returns false for a REJECTED request', () => {
      expect(component.hasActions(makeAidRequest(AidRequestStatus.REJECTED))).toBe(false);
    });
  });

  describe('openActionsMenu', () => {
    const menu = { toggle: jest.fn() };
    const event = {} as MouseEvent;

    it('offers "Mark as Under Review" and "Reject" for a PENDING request', () => {
      component.openActionsMenu(menu, event, makeAidRequest(AidRequestStatus.PENDING));
      const labels = component.rowActionItems.map((item) => item.label);

      expect(labels).toContain('Mark as Under Review');
      expect(labels).toContain('Reject');
      expect(labels).not.toContain('Approve');
    });

    it('offers "Approve" and "Reject" for an UNDER_REVIEW request', () => {
      component.openActionsMenu(menu, event, makeAidRequest(AidRequestStatus.UNDER_REVIEW));
      const labels = component.rowActionItems.map((item) => item.label);

      expect(labels).toContain('Approve');
      expect(labels).toContain('Reject');
      expect(labels).not.toContain('Mark as Under Review');
    });

    it('calls menu.toggle after building items', () => {
      const toggleSpy = jest.fn();
      component.openActionsMenu({ toggle: toggleSpy }, event, makeAidRequest(AidRequestStatus.PENDING));
      expect(toggleSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('onPageChange', () => {
    it('calculates the correct page from first/rows offset', () => {
      component.onPageChange({ first: 20, rows: 10 });
      expect(component.page).toBe(3);
      expect(component.limit).toBe(10);
    });

    it('falls back to the existing limit when rows is undefined', () => {
      component.limit = 10;
      component.onPageChange({ first: 10 });
      expect(component.limit).toBe(10);
    });
  });

  describe('onApplyFilter', () => {
    it('resets page to 1 and triggers a fetch', () => {
      component.page = 5;
      component.onApplyFilter();
      expect(component.page).toBe(1);
      expect(storeService.loadManagerRequests).toHaveBeenCalled();
    });
  });
});
