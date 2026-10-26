import { Routes } from '@angular/router';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';
import { AddTripComponent } from './add-trip/add-trip.component';

export const routes: Routes = [
  { path: '', component: TripListingComponent },
  { path: 'add-trip', component: AddTripComponent },
  { path: 'edit-trip/:tripCode', component: EditTripComponent },
  { path: '**', redirectTo: '' }
];
