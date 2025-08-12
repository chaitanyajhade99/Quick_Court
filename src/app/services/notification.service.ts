import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private backendUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  private sendSms(to: string, message: string) {
    return this.http.post(`${this.backendUrl}/send-sms`, { to, message });
  }

  sendBookingConfirmationSms(booking: any) {
    const message = `Booking Confirmed! Your booking for ${booking.turfName} on ${booking.date} at ${booking.slot} is successful. Booking ID: TURF-${booking.id}`;
    this.sendSms(booking.userPhone, message).subscribe({
      next: () => console.log('Confirmation SMS sent successfully.'),
      error: (err) => console.error('Failed to send confirmation SMS:', err)
    });
  }

  sendCancellationSms(booking: any) {
    const message = `Booking Canceled. Your booking for ${booking.turfName} on ${booking.date} at ${booking.slot} has been canceled.`;
     this.sendSms(booking.userPhone, message).subscribe({
      next: () => console.log('Cancellation SMS sent successfully.'),
      error: (err) => console.error('Failed to send cancellation SMS:', err)
    });
  }
}