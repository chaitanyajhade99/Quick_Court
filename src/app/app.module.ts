import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TurfListComponent } from './components/turf-list/turf-list.component';
import { TurfDetailsComponent } from './components/turf-details/turf-details.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { PaymentComponent } from './components/payment/payment.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';
import { AdminTurfManagementComponent } from './components/admin-turf-management/admin-turf-management.component';

import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminNewDashboardComponent } from './components/admin-new-dashboard/admin-new-dashboard.component';
import { AdminFacilityApprovalComponent } from './components/admin-facility-approval/admin-facility-approval.component';
import { AdminUserManagementComponent } from './components/admin-user-management/admin-user-management.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';

import { NgChartsModule } from 'ng2-charts';

export function playerFactory() {
  return player;
}
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    TurfListComponent,
    TurfDetailsComponent,
    MyBookingsComponent,
    AdminDashboardComponent,
    PaymentComponent,
    BookingConfirmationComponent,
    AdminTurfManagementComponent,
    AdminLayoutComponent,
    AdminNewDashboardComponent,
    AdminFacilityApprovalComponent,
    AdminUserManagementComponent,
    AdminReportsComponent,
    AdminProfileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LottieModule.forRoot({ player: playerFactory }),
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }