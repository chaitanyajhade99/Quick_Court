import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewDashboardComponent } from './admin-new-dashboard.component';

describe('AdminNewDashboardComponent', () => {
  let component: AdminNewDashboardComponent;
  let fixture: ComponentFixture<AdminNewDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminNewDashboardComponent]
    });
    fixture = TestBed.createComponent(AdminNewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
