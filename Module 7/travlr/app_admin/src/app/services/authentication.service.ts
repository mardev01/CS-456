import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
interface TokenPayload { name: string; email: string; exp: number; }
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly tokenKey = 'travlr-token';
  constructor(private readonly http: HttpClient) {}
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('http://localhost:3000/api/login', { email, password })
      .pipe(tap(response => sessionStorage.setItem(this.tokenKey, response.token)));
  }
  saveToken(token:string):void { sessionStorage.setItem(this.tokenKey,token); }
  getToken(): string | null { return sessionStorage.getItem(this.tokenKey); }
  logout(): void { sessionStorage.removeItem(this.tokenKey); }
  currentUser(): TokenPayload | null {
    try {
      const token = this.getToken();
      if (!token) return null;
      const data: TokenPayload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!data.exp || data.exp * 1000 <= Date.now()) { this.logout(); return null; }
      return data;
    } catch { this.logout(); return null; }
  }
  isLoggedIn(): boolean { return this.currentUser() !== null; }
}
