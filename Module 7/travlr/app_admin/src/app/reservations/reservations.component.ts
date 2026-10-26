import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Reservation } from '../services/admin-data.service';
@Component({selector:'app-reservations',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./reservations.component.html'})
export class ReservationsComponent implements OnInit {
  reservations:Reservation[]=[];loading=true;error='';search='';pending:Reservation|null=null;saving=false;
  constructor(private readonly data:AdminDataService) {}
  ngOnInit():void {this.data.reservations().subscribe({next:rows=>{this.reservations=rows;this.loading=false;},error:()=>{this.error='Reservations could not be loaded.';this.loading=false;}});}
  get filtered():Reservation[]{const q=this.search.toLowerCase();return this.reservations.filter(r=>(r.reference+' '+r.trip.name+' '+r.customer?.name+' '+r.customer?.email).toLowerCase().includes(q));}
  confirm():void {
    if(!this.pending||this.saving)return;this.saving=true;const reservation=this.pending;
    this.data.setStatus(reservation._id,reservation.status==='confirmed'?'cancelled':'confirmed').subscribe({next:updated=>{this.reservations=this.reservations.map(r=>r._id===updated._id?updated:r);this.pending=null;this.saving=false;},error:()=>{this.error='The reservation could not be updated.';this.saving=false;}});
  }
}
