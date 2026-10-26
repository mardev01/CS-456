import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TripCardComponent } from '../trip-card/trip-card.component';
import { Trip } from '../models/trip';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-trip-listing', standalone: true,
  imports: [CommonModule, FormsModule, TripCardComponent, RouterLink],
  templateUrl: './trip-listing.component.html', styleUrl: './trip-listing.component.css'
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  search='';
  get filteredTrips():Trip[] { const q=this.search.toLowerCase().trim(); return this.trips.filter(t=>(t.code+' '+t.name+' '+t.resort).toLowerCase().includes(q)); }
  loading = true;
  error = '';
  updated = false;
  deleted = false;
  deletingCode = '';
  pendingDelete: Trip | null = null;

  constructor(private readonly tripDataService: TripDataService, private readonly route: ActivatedRoute) {}

  requestDelete(trip: Trip): void { this.pendingDelete = trip; }

  confirmDelete(): void {
    if (!this.pendingDelete || this.deletingCode) return;
    const trip = this.pendingDelete;
    this.deletingCode = trip.code;
    this.error = '';
    this.tripDataService.deleteTrip(trip.code).subscribe({
      next: () => {
        this.trips = this.trips.filter(item => item.code !== trip.code);
        this.pendingDelete = null; this.deletingCode = ''; this.deleted = true;
      },
      error: error => { this.error = error.error?.message || 'Trip could not be deleted.'; this.deletingCode = ''; }
    });
  }

  ngOnInit(): void {
    this.updated = this.route.snapshot.queryParamMap.has('updated');
    this.tripDataService.getTrips().subscribe({
      next: (trips) => { this.trips = trips; this.loading = false; },
      error: () => {
        this.error = 'Trips could not be loaded. Check that Express and MongoDB are running.';
        this.loading = false;
      }
    });
  }
}
