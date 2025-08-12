import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTurfManagementComponent } from './admin-turf-management.component';

describe('AdminTurfManagementComponent', () => {
  let component: AdminTurfManagementComponent;
  let fixture: ComponentFixture<AdminTurfManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminTurfManagementComponent]
    });
    fixture = TestBed.createComponent(AdminTurfManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
