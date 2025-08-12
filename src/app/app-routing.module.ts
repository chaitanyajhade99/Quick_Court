import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TurfListComponent } from './components/turf-list/turf-list.component';
import { TurfDetailsComponent } from './components/turf-details/turf-details.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { PaymentComponent } from './components/payment/payment.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';
import { AdminTurfManagementComponent } from './components/admin-turf-management/admin-turf-management.component';

import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminNewDashboardComponent } from './components/admin-new-dashboard/admin-new-dashboard.component';
import { AdminFacilityApprovalComponent } from './components/admin-facility-approval/admin-facility-approval.component';
import { AdminUserManagementComponent } from './components/admin-user-management/admin-user-management.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';
import { SuperAdminGuard } from './guards/super-admin.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: '', component: TurfListComponent },

  { path: 'turf/:id', component: TurfDetailsComponent, canActivate: [AuthGuard] },
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'confirmation/:id', component: BookingConfirmationComponent, canActivate: [AuthGuard] },

  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/turfs', component: AdminTurfManagementComponent, canActivate: [AuthGuard] },

  {
    path: 'admin-panel',
    component: AdminLayoutComponent,
    canActivate: [SuperAdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminNewDashboardComponent },
      { path: 'facility-approval', component: AdminFacilityApprovalComponent },
      { path: 'user-management', component: AdminUserManagementComponent },
      { path: 'reports', component: AdminReportsComponent },
      { path: 'profile', component: AdminProfileComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }