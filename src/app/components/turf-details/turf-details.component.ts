import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TurfService } from '../../services/turf.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-turf-details',
  templateUrl: './turf-details.component.html',
  styleUrls: ['./turf-details.component.css']
})
export class TurfDetailsComponent implements OnInit {
  turf: any;
  allSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', 
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
    '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-00:00'
  ];
  bookedSlots: Set<string> = new Set();
  
  selectedDate: Date | null = null;
  selectedSlot: string | null = null;
  turfId!: number;
  todaysDate: Date;

  constructor(
    private route: ActivatedRoute,
    private turfService: TurfService,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {
    this.todaysDate = new Date();
  }

  ngOnInit(): void {
    this.turfId = +this.route.snapshot.paramMap.get('id')!;
    this.turfService.getTurfById(this.turfId).subscribe(data => {
      this.turf = data;
    });
  }

  private formatDate(date: Date): string {
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${date.getFullYear()}-${month}-${day}`;
  }

  loadSlots() {
    if (this.selectedDate && this.turfId) {
      const formattedDate = this.formatDate(this.selectedDate);
      const currentlyBooked = this.bookingService.getBookedSlots(this.turfId, formattedDate);
      this.bookedSlots = new Set(currentlyBooked);
    }
  }
  
  isSlotBooked(slot: string): boolean {
    if (this.bookedSlots.has(slot)) {
      return true;
    }

    if (this.selectedDate && this.formatDate(this.selectedDate) === this.formatDate(this.todaysDate)) {
      const slotStartHour = parseInt(slot.split(':')[0], 10);
      const currentHour = new Date().getHours();
      if (slotStartHour <= currentHour) {
        return true;
      }
    }

    return false;
  }

  selectSlot(slot: string) {
    this.selectedSlot = slot;
  }

  proceedToPayment() {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      alert('You must be logged in to book a slot.');
      return;
    }
    
    if (this.selectedSlot && this.selectedDate && this.turf) {
      const pendingBooking = {
        turfId: this.turf.id,
        turfName: this.turf.name,
        price: this.turf.price,
        userId: currentUser.id,
        userPhone: currentUser.phone,
        date: this.formatDate(this.selectedDate),
        slot: this.selectedSlot
      };
      
      this.bookingService.setPendingBooking(pendingBooking);
      this.router.navigate(['/payment']);
    }
  }
}