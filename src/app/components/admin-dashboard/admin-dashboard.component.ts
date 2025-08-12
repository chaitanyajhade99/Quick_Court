import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { TurfService } from '../../services/turf.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  turfs$!: Observable<any[]>;
  allSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', 
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
    '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-00:00'
  ];
  
  selectedDate: string;
  dailySchedule$!: Observable<any[]>;
  blockSlotForm: FormGroup;

  constructor(
    private bookingService: BookingService,
    private turfService: TurfService,
    private fb: FormBuilder
  ) {
    this.selectedDate = this.formatDate(new Date());
    
    this.blockSlotForm = this.fb.group({
      turfId: ['', Validators.required],
      slot: ['', Validators.required],
      reason: ['Maintenance', Validators.required]
    });
  }

  ngOnInit(): void {
    this.turfs$ = this.turfService.getTurfs();
    this.loadSchedule();
  }

  private formatDate(date: Date): string {
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${date.getFullYear()}-${month}-${day}`;
  }

  changeDay(offset: number): void {
    const currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() + offset);
    this.selectedDate = this.formatDate(currentDate);
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.dailySchedule$ = this.turfService.getTurfs().pipe(
      map(turfs => {
        const bookingsForDate = this.bookingService.getBookingsByDate(this.selectedDate);
        return turfs.map(turf => {
          const turfBookings = bookingsForDate.filter(b => b.turfId === turf.id);
          return {
            turfName: turf.name,
            slots: this.allSlots.map(slot => {
              const booking = turfBookings.find(b => b.slot === slot);
              return {
                time: slot,
                booking: booking || null
              };
            })
          };
        });
      })
    );
  }

  onBlockSlot(): void {
    if (this.blockSlotForm.valid) {
      const formValue = this.blockSlotForm.value;
      this.turfs$.subscribe(turfs => {
        const selectedTurf = turfs.find(t => t.id == formValue.turfId);
        if(selectedTurf) {
          const blockDetails = {
            turfId: selectedTurf.id,
            turfName: selectedTurf.name,
            date: this.selectedDate,
            slot: formValue.slot,
            reason: formValue.reason,
            userId: 'ADMIN'
          };
          this.bookingService.blockSlot(blockDetails);
          this.loadSchedule();
          alert(`Slot ${formValue.slot} has been blocked for ${selectedTurf.name}.`);
        }
      });
    }
  }
}