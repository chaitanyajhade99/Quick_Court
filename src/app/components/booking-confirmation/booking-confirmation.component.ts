import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.css']
})
export class BookingConfirmationComponent implements OnInit {
  booking$!: Observable<any>;

  constructor(private route: ActivatedRoute, private bookingService: BookingService) { }

  ngOnInit(): void {
    const bookingId = +this.route.snapshot.paramMap.get('id')!;
    if (bookingId) {
      this.booking$ = this.bookingService.getBookingById(bookingId);
    }
  }
}