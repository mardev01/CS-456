import { Routes } from '@angular/router';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';
import { AddTripComponent } from './add-trip/add-trip.component';
import { LoginComponent } from './login/login.component';
import { CustomersComponent } from './customers/customers.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { SettingsComponent } from './settings/settings.component';
import { authGuard } from './services/auth.guard';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: TripListingComponent, canActivate: [authGuard] },
  { path: 'add-trip', component: AddTripComponent, canActivate: [authGuard] },
  { path: 'edit-trip/:tripCode', component: EditTripComponent, canActivate: [authGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [authGuard] },
  { path: 'reservations', component: ReservationsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
