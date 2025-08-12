import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { Observable } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { TurfService } from '../../services/turf.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-new-dashboard',
  templateUrl: './admin-new-dashboard.component.html',
  styleUrls: ['./admin-new-dashboard.component.css']
})
export class AdminNewDashboardComponent implements OnInit {
  totalUsers$!: Observable<number>;
  totalFacilities$!: Observable<number>;
  totalBookings$!: Observable<number>;
  totalActiveCourts$!: Observable<number>;

  public lineChartData!: ChartConfiguration['data'];
  public lineChartOptions: ChartConfiguration['options'] = { responsive: true };

  public barChartData!: ChartConfiguration['data'];
  public barChartOptions: ChartConfiguration['options'] = { responsive: true };

  public doughnutChartData!: ChartConfiguration['data'];
  public earningsChartData!: ChartConfiguration['data'];

  constructor(
    private userService: UserService,
    private turfService: TurfService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.totalUsers$ = this.userService.getTotalUsers();
    this.totalFacilities$ = this.turfService.getTotalTurfs();
    this.totalBookings$ = this.bookingService.getTotalBookings();
    this.totalActiveCourts$ = this.turfService.getTotalActiveTurfs();

    this.initializeCharts();
  }

  initializeCharts(): void {
    this.lineChartData = {
      datasets: [{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Bookings', fill: 'origin' }],
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July']
    };

    this.barChartData = {
      labels: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4'],
      datasets: [{ data: [20, 45, 60, 90], label: 'New Users' }]
    };

    this.doughnutChartData = {
      labels: ['Football', 'Cricket', 'Tennis'],
      datasets: [{ data: [350, 450, 100] }]
    };

    this.earningsChartData = {
        datasets: [{ data: [12000, 19000, 15000, 25000, 22000, 30000, 28000], label: 'Earnings (INR)', tension: 0.4, borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.2)', fill: 'origin' }],
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July']
    };
  }
}