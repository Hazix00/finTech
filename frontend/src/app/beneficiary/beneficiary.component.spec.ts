import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { AidCategory, AidRequest, AidRequestStatus } from '../shared/models/aid-request.model';
import { BeneficiaryComponent } from './beneficiary.component';

const emptyRequests$ = new BehaviorSubject<AidRequest[]>([]).asObservable();
const emptyTotal$ = new BehaviorSubject<number>(0).asObservable();
const emptyActiveCount$ = new BehaviorSubject<number>(0);

function makeStoreService(activeCountSubject = emptyActiveCount$) {
  return {
    beneficiaryRequests$: emptyRequests$,
    beneficiaryTotal$: emptyTotal$,
    beneficiaryActiveCount$:
      activeCountSubject instanceof BehaviorSubject
        ? activeCountSubject.asObservable()
        : activeCountSubject,
    loadBeneficiaryRequests: jest
      .fn()
      .mockReturnValue(of({ items: [], total: 0, page: 1, limit: 5 })),
    loadBeneficiaryActiveCount: jest.fn().mockReturnValue(of(0)),
    createAidRequest: jest.fn(),
  };
}

const mockMessageService = { add: jest.fn() };

describe('BeneficiaryComponent', () => {
  let component: BeneficiaryComponent;
  let storeService: ReturnType<typeof makeStoreService>;

  beforeEach(() => {
    jest.clearAllMocks();
    storeService = makeStoreService();
    component = new BeneficiaryComponent(
      new FormBuilder(),
      storeService as any,
      mockMessageService as any,
    );
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  describe('form validation', () => {
    it('is invalid when empty', () => {
      expect(component.requestForm.invalid).toBe(true);
    });

    it('is valid when all required fields are filled', () => {
      component.requestForm.setValue({
        category: AidCategory.HEALTH,
        amount: 100,
        description: 'Need help paying rent',
      });
      expect(component.requestForm.valid).toBe(true);
    });

    it('amount field is invalid when value is 0', () => {
      component.requestForm.setValue({
        category: AidCategory.FOOD,
        amount: 0,
        description: 'test',
      });
      expect(component.requestForm.get('amount')?.invalid).toBe(true);
    });

    it('amount field is invalid when value exceeds 5000', () => {
      component.requestForm.setValue({
        category: AidCategory.FOOD,
        amount: 5001,
        description: 'test',
      });
      expect(component.requestForm.get('amount')?.invalid).toBe(true);
    });

    it('amount field is valid at the 5000 boundary', () => {
      component.requestForm.setValue({
        category: AidCategory.FOOD,
        amount: 5000,
        description: 'test',
      });
      expect(component.requestForm.get('amount')?.valid).toBe(true);
    });
  });

  describe('submitRequest', () => {
    it('does not call the store when the form is invalid', () => {
      component.submitRequest();
      expect(storeService.createAidRequest).not.toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('calculates the correct page from first/rows offset', () => {
      component.onPageChange({ first: 10, rows: 5 });
      expect(component.page).toBe(3);
      expect(component.limit).toBe(5);
    });

    it('falls back to the existing limit when rows is undefined', () => {
      component.limit = 5;
      component.onPageChange({ first: 5 });
      expect(component.limit).toBe(5);
    });
  });

  describe('onApplyFilter', () => {
    it('resets page to 1 and triggers a fetch', () => {
      component.page = 4;
      component.onApplyFilter();
      expect(component.page).toBe(1);
      expect(storeService.loadBeneficiaryRequests).toHaveBeenCalled();
    });
  });

  describe('activeAtLimit', () => {
    it('is false when active request count is below 2', () => {
      expect(component.activeAtLimit).toBe(false);
    });

    it('becomes true when the store emits an active count of 2', () => {
      const activeCountSubject = new BehaviorSubject<number>(0);
      const store = makeStoreService(activeCountSubject);
      const comp = new BeneficiaryComponent(
        new FormBuilder(),
        store as any,
        mockMessageService as any,
      );
      comp.ngOnInit();

      expect(comp.activeAtLimit).toBe(false);
      activeCountSubject.next(2);
      expect(comp.activeAtLimit).toBe(true);

      comp.ngOnDestroy();
    });
  });
});
