import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Customer { _id: string; name: string; email: string; active: boolean; createdAt: string; }
export interface Reservation {
  _id: string; reference: string; status: 'confirmed'|'cancelled'; travelers: number; totalCents: number;
  trip: { name: string; start: string; resort: string; length: string; };
  customer: { name: string; email: string; } | null;
}
@Injectable({ providedIn:'root' })
export class AdminDataService {
  private readonly base='http://localhost:3000/api';
  constructor(private readonly http:HttpClient) {}
  customers():Observable<Customer[]> { return this.http.get<Customer[]>(this.base+'/customers'); }
  setActive(id:string,active:boolean):Observable<Customer> { return this.http.patch<Customer>(this.base+'/customers/'+encodeURIComponent(id),{active}); }
  reservations():Observable<Reservation[]> { return this.http.get<Reservation[]>(this.base+'/reservations'); }
  setStatus(id:string,status:string):Observable<Reservation> { return this.http.patch<Reservation>(this.base+'/reservations/'+encodeURIComponent(id),{status}); }
  profile():Observable<{name:string;email:string}> { return this.http.get<{name:string;email:string}>(this.base+'/staff/me'); }
  updateProfile(name:string):Observable<{name:string;email:string;token:string}> { return this.http.put<{name:string;email:string;token:string}>(this.base+'/staff/me',{name}); }
}
