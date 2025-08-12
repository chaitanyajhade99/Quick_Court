import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  pendingBooking: any;
  isLoading = true;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.bookingService.getPendingBooking().subscribe(booking => {
      this.pendingBooking = booking;
      if (this.pendingBooking) {
        this.isLoading = false;
      }
    });
  }

  initiatePayment() {
    this.isLoading = true;
    const orderData = {
      amount: this.pendingBooking.price * 100,
      receipt: `receipt_turf_${Date.now()}`
    };

    this.http.post<any>('http://localhost:3000/create-order', orderData).subscribe({
      next: (order) => {
        this.launchRazorpayCheckout(order);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        alert('Payment server could not be reached. Please ensure the backend server is running and your Razorpay keys are correct.');
        console.error('Backend Error:', err);
      }
    });
  }

  launchRazorpayCheckout(order: any) {
    const currentUser = this.authService.currentUserValue;
    const options = {
      key: 'rzp_test_90Gcc3nOFHaSbN',
      amount: order.amount,
      currency: 'INR',
      name: 'Turf Booker',
      description: `Booking for ${this.pendingBooking.turfName}`,
      order_id: order.id,
      handler: (response: any) => {
        this.zone.run(() => {
          const bookingId = this.bookingService.confirmPendingBooking();
          this.router.navigate(['/confirmation', bookingId]);
        });
      },
      prefill: {
        name: currentUser.email,
        email: currentUser.email,
        contact: currentUser.phone
      },
      notes: {
        address: 'Turf Booking Inc.'
      },
      theme: {
        color: '#007bff'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}