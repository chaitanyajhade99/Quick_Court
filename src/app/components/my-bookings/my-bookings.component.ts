import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { TurfService } from '../../services/turf.service';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  myBookings$!: Observable<any[]>;
  ratingForm: FormGroup;
  bookingToRateId: number | null = null;
  currentDate = new Date().toISOString().split('T')[0];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private turfService: TurfService,
    private fb: FormBuilder
  ) {
    this.ratingForm = this.fb.group({
      stars: [5, Validators.required],
      comment: ['', Validators.maxLength(200)]
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.myBookings$ = this.bookingService.getUserBookings(currentUser.id);
    }
  }
  
  toggleRatingForm(bookingId: number) {
    this.bookingToRateId = this.bookingToRateId === bookingId ? null : bookingId;
  }

  submitRating(booking: any) {
    if (this.ratingForm.valid) {
      this.turfService.addRating(booking.turfId, this.ratingForm.value);
      this.bookingService.markBookingAsRated(booking.id);
      this.bookingToRateId = null;
      alert('Thank you for your feedback!');
    }
  }

  cancelBooking(booking: any) {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      this.bookingService.cancelBooking(booking);
    }
  }
}