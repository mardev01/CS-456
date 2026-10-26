import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TripCardComponent } from '../trip-card/trip-card.component';
import { Trip } from '../models/trip';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-trip-listing', standalone: true,
  imports: [CommonModule, TripCardComponent, RouterLink],
  templateUrl: './trip-listing.component.html', styleUrl: './trip-listing.component.css'
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  loading = true;
  error = '';
  updated = false;

  constructor(private readonly tripDataService: TripDataService, private readonly route: ActivatedRoute) {}

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
