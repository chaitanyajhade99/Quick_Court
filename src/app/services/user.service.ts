import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<any[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor() {
    const storedUsers = localStorage.getItem('users');
    this.usersSubject.next(storedUsers ? JSON.parse(storedUsers) : []);
  }

  private updateLocalStorage(users: any[]) {
    localStorage.setItem('users', JSON.stringify(users));
    this.usersSubject.next(users);
  }

  getAllUsers(): Observable<any[]> {
    return this.users$;
  }

  getTotalUsers(): Observable<number> {
    return this.users$.pipe(map(users => users.length));
  }

  toggleUserBanStatus(userId: number) {
    const currentUsers = this.usersSubject.getValue();
    const userIndex = currentUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      currentUsers[userIndex].isBanned = !currentUsers[userIndex].isBanned;
      this.updateLocalStorage(currentUsers);
    }
  }
}