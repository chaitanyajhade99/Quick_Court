import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFacilityApprovalComponent } from './admin-facility-approval.component';

describe('AdminFacilityApprovalComponent', () => {
  let component: AdminFacilityApprovalComponent;
  let fixture: ComponentFixture<AdminFacilityApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminFacilityApprovalComponent]
    });
    fixture = TestBed.createComponent(AdminFacilityApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
