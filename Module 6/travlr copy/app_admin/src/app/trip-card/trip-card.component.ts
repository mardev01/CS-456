import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-card', standalone: true, imports: [CommonModule, RouterLink],
  templateUrl: './trip-card.component.html', styleUrl: './trip-card.component.css'
})
export class TripCardComponent {
  @Input({ required: true }) trip!: Trip;
}
