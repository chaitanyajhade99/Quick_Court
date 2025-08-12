import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TurfService {
  private turfs = new BehaviorSubject<any[]>([
    {
      id: 1,
      name: 'City Arena',
      location: 'Kalyan West',
      price: 1200,
      description: 'Premium 5-a-side AstroTurf with brilliant floodlights for night games.',
      imageUrl: 'assets/images/CityArena.jpg',
      status: 'approved',
      ratings: []
    },
    {
      id: 2,
      name: 'Goal Zone',
      location: 'Thane West',
      price: 1500,
      description: 'Spacious, well-maintained ground for 7-a-side football and cricket.',
      imageUrl: 'assets/images/Goalzone.jpg',
      status: 'approved',
      ratings: []
    },
    {
      id: 3,
      name: 'Kick Off',
      location: 'Dombivli East',
      price: 1000,
      description: 'A clean and affordable turf that is perfect for daily practice sessions.',
      imageUrl: 'assets/images/Kickoff.jpg',
      status: 'pending',
      ratings: []
    },
    {
      id: 4,
      name: 'The Turf Park',
      location: 'Andheri West',
      price: 1800,
      description: 'Rooftop turf offering a premium experience with excellent amenities.',
      imageUrl: 'assets/images/TheTurfPark.jpg',
      status: 'approved',
      ratings: []
    },
    {
      id: 5,
      name: 'Playmakers Arena',
      location: 'Borivali East',
      price: 1400,
      description: 'FIFA-approved turf for a professional playing feel, perfect for competitive matches.',
      imageUrl: 'assets/images/PlaymakersArena.jpg',
      status: 'approved',
      ratings: []
    },
    {
      id: 6,
      name: 'Sportsville',
      location: 'Navi Mumbai',
      price: 1600,
      description: 'A massive multi-sport complex with multiple pitches for football and cricket.',
      imageUrl: 'assets/images/Sportsville.jpg',
      status: 'rejected',
      ratings: []
    },
    {
      id: 7,
      name: 'Box Play',
      location: 'Ghatkopar West',
      price: 1350,
      description: 'Ideal for fast-paced 5-a-side games and box cricket, with a great cafe.',
      imageUrl: 'assets/images/BoxPlay.jpg',
      status: 'approved',
      ratings: []
    },
    {
      id: 8,
      name: 'The Green Pitch',
      location: 'Mulund West',
      price: 1100,
      description: 'A lush green, well-maintained turf offering great value for money.',
      imageUrl: 'assets/images/TheGreenPitch.jpg',
      status: 'pending',
      ratings: []
    }
  ]);
  turfs$ = this.turfs.asObservable();

  constructor() { }

  getTurfs() {
    return this.turfs$;
  }

  getVisibleTurfs(): Observable<any[]> {
    return this.turfs$.pipe(
        map(turfs => turfs.filter(t => t.status === 'approved'))
    );
  }

  getTurfById(id: number) {
    const turf = this.turfs.getValue().find(t => t.id === id);
    return of(turf);
  }

  addRating(turfId: number, rating: { stars: number, comment: string }) {
    const currentTurfs = this.turfs.getValue();
    const turfIndex = currentTurfs.findIndex(t => t.id === turfId);
    if (turfIndex > -1) {
      currentTurfs[turfIndex].ratings.push(rating);
      this.turfs.next([...currentTurfs]);
    }
  }

  getAverageRating(turf: any): number {
    if (!turf.ratings || turf.ratings.length === 0) {
      return 0;
    }
    const totalStars = turf.ratings.reduce((sum: number, r: any) => sum + r.stars, 0);
    return totalStars / turf.ratings.length;
  }

  addTurf(turfData: any) {
    const currentTurfs = this.turfs.getValue();
    const newTurf = {
      id: currentTurfs.length > 0 ? Math.max(...currentTurfs.map(t => t.id)) + 1 : 1,
      ...turfData,
      status: 'pending',
      ratings: []
    };
    this.turfs.next([...currentTurfs, newTurf]);
  }

  updateTurf(updatedTurf: any) {
    const currentTurfs = this.turfs.getValue();
    const turfIndex = currentTurfs.findIndex(t => t.id === updatedTurf.id);
    if (turfIndex > -1) {
      currentTurfs[turfIndex] = { ...currentTurfs[turfIndex], ...updatedTurf };
      this.turfs.next([...currentTurfs]);
    }
  }

  deleteTurf(turfId: number) {
    const currentTurfs = this.turfs.getValue().filter(t => t.id !== turfId);
    this.turfs.next(currentTurfs);
  }

  updateTurfStatus(turfId: number, status: 'approved' | 'rejected') {
    const currentTurfs = this.turfs.getValue();
    const turfIndex = currentTurfs.findIndex(t => t.id === turfId);
    if (turfIndex > -1) {
      currentTurfs[turfIndex].status = status;
      this.turfs.next([...currentTurfs]);
    }
  }

  getTotalTurfs(): Observable<number> {
    return this.turfs$.pipe(map(turfs => turfs.length));
  }

  getTotalActiveTurfs(): Observable<number> {
    return this.turfs$.pipe(map(turfs => turfs.filter(t => t.status === 'approved').length));
  }
}