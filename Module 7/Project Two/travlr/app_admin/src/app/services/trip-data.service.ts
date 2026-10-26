import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip';

@Injectable({ providedIn: 'root' })
export class TripDataService {
  private readonly apiUrl = 'http://localhost:3000/api/trips';

  constructor(private readonly http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl);
  }

  getTrip(tripCode: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.tripUrl(tripCode));
  }

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip);
  }

  updateTrip(tripCode: string, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(this.tripUrl(tripCode), trip);
  }

  deleteTrip(tripCode: string): Observable<void> {
    return this.http.delete<void>(this.tripUrl(tripCode));
  }

  private tripUrl(tripCode: string): string {
    return `${this.apiUrl}/${encodeURIComponent(tripCode)}`;
  }
}
