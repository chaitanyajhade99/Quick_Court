import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookings = new BehaviorSubject<any[]>([]);
  bookings$ = this.bookings.asObservable();

  private pendingBooking: any = null;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
    ) {
    const storedBookings = localStorage.getItem('bookings');
    this.bookings.next(storedBookings ? JSON.parse(storedBookings) : []);
  }

  private updateLocalStorage(bookings: any[]) {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }

  getBookedSlots(turfId: number, date: string): string[] {
    const currentBookings = this.bookings.getValue();
    return currentBookings
      .filter(b => b.turfId === turfId && b.date === date)
      .map(b => b.slot);
  }

  addBooking(booking: any) {
    const currentBookings = this.bookings.getValue();
    const updatedBookings = [...currentBookings, booking];
    this.bookings.next(updatedBookings);
    this.updateLocalStorage(updatedBookings);
  }

  blockSlot(blockDetails: any) {
    const allBookings = this.bookings.getValue();
    const newBooking = {
      ...blockDetails,
      id: allBookings.length > 0 ? Math.max(...allBookings.map(b => b.id || 0)) + 1 : 1,
      isBlocked: true,
      turfName: blockDetails.turfName
    };
    this.addBooking(newBooking);
  }

  setPendingBooking(booking: any) {
    this.pendingBooking = booking;
  }

  getPendingBooking() {
    return of(this.pendingBooking);
  }

  confirmPendingBooking(): number {
    const allBookings = this.bookings.getValue();
    const bookingId = allBookings.length > 0 ? Math.max(...allBookings.map(b => b.id || 0)) + 1 : 1;

    this.pendingBooking.id = bookingId;
    this.addBooking(this.pendingBooking);

    this.notificationService.sendBookingConfirmationSms(this.pendingBooking);

    this.pendingBooking = null;
    return bookingId;
  }

  getBookingById(id: number) {
    const booking = this.bookings.getValue().find(b => b.id === id);
    return of(booking);
  }

  getBookingsByDate(date: string) {
    return this.bookings.getValue().filter(b => b.date === date);
  }

  getUserBookings(userId: number): Observable<any[]> {
    return this.bookings$.pipe(
      map(bookings => bookings.filter(b => b.userId === userId))
    );
  }

  markBookingAsRated(bookingId: number) {
    const currentBookings = this.bookings.getValue();
    const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex > -1) {
      currentBookings[bookingIndex].isRated = true;
      this.bookings.next([...currentBookings]);
      this.updateLocalStorage(currentBookings);
    }
  }

  cancelBooking(booking: any) {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = allUsers.find((u: any) => u.id === booking.userId);

    if (user && user.phone) {
      const enrichedBooking = { ...booking, userPhone: user.phone };
      this.notificationService.sendCancellationSms(enrichedBooking);
    }

    let currentBookings = this.bookings.getValue();
    currentBookings = currentBookings.filter(b => b.id !== booking.id);
    this.bookings.next(currentBookings);
    this.updateLocalStorage(currentBookings);
  }

  getTotalBookings(): Observable<number> {
      return this.bookings$.pipe(
          map(bookings => bookings.filter(b => !b.isBlocked).length)
      );
  }
}