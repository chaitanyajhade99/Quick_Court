import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: any[] = [];
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    const storedUsers = localStorage.getItem('users');
    this.users = storedUsers ? JSON.parse(storedUsers) : [];

    const storedCurrentUser = localStorage.getItem('currentUser');
    if (storedCurrentUser) {
      this.currentUserSubject.next(JSON.parse(storedCurrentUser));
    }
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  register(user: any): boolean {
    if (this.users.find(u => u.email === user.email)) {
      return false;
    }
    user.id = this.users.length + 1;
    user.role = 'user';
    user.isBanned = false;
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    return true;
  }

  login(credentials: any): boolean {
    if (credentials.email === 'admin' && credentials.password === 'admin123') {
        const superAdminUser = { id: -1, email: 'admin', role: 'super-admin' };
        this.setCurrentUser(superAdminUser);
        this.router.navigate(['/admin-panel']);
        return true;
    }

    if (credentials.email === 'fowner' && credentials.password === 'fowner123') {
      const adminUser = { id: 0, email: 'fowner', role: 'admin' };
      this.setCurrentUser(adminUser);
      this.router.navigate(['/admin']);
      return true;
    }

    const user = this.users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (user) {
        if(user.isBanned) {
            alert('Your account has been banned. Please contact support.');
            return false;
        }
      this.setCurrentUser(user);
      this.router.navigate(['/']);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}