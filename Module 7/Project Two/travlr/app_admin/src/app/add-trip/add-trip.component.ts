import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-add-trip', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-trip.component.html', styleUrl: './add-trip.component.css'
})
export class AddTripComponent implements OnInit {
  addForm!: FormGroup;
  submitted = false;
  saving = false;
  error = '';

  constructor(private readonly formBuilder: FormBuilder,
    private readonly router: Router, private readonly tripService: TripDataService) {}

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
      name: ['', Validators.required], length: ['', Validators.required],
      start: ['', Validators.required], resort: ['', Validators.required],
      perPerson: ['', [Validators.required, Validators.min(0)]],
      image: ['', Validators.required], description: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.addForm.invalid || this.saving) return;
    this.saving = true;
    this.error = '';
    const trip = { ...this.addForm.value, perPerson: String(this.addForm.value.perPerson) };
    this.tripService.addTrip(trip).subscribe({
      next: () => { this.router.navigate(['/']); },
      error: (error) => {
        this.error = error.error?.message || 'Trip could not be saved. Please try again.';
        this.saving = false;
      }
    });
  }
}
