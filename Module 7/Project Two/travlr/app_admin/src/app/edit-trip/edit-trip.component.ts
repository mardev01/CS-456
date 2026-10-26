import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';

@Component({
  selector: 'app-edit-trip', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-trip.component.html', styleUrl: './edit-trip.component.css'
})
export class EditTripComponent implements OnInit {
  editForm!: FormGroup;
  submitted = false;
  loading = true;
  saving = false;
  error = '';
  private tripCode = '';

  constructor(private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute, private readonly router: Router,
    private readonly tripService: TripDataService) {}

  ngOnInit(): void {
    this.editForm = this.formBuilder.group({
      code: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required], length: ['', Validators.required],
      start: ['', Validators.required], resort: ['', Validators.required],
      perPerson: ['', [Validators.required, Validators.min(0)]],
      image: ['', Validators.required], description: ['', Validators.required]
    });
    this.tripCode = this.route.snapshot.paramMap.get('tripCode') || '';
    this.tripService.getTrip(this.tripCode).subscribe({
      next: (trips) => {
        const trip = trips[0];
        if (!trip) { this.error = 'Trip not found.'; this.loading = false; return; }
        this.editForm.patchValue({ ...trip, start: trip.start.slice(0, 10) });
        this.loading = false;
      },
      error: (error) => {
        this.error = error.status === 404 ? 'Trip not found.' : 'Trip could not be loaded.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.editForm.invalid || this.saving || this.loading) return;
    this.saving = true;
    this.error = '';
    const values = this.editForm.getRawValue();
    const trip = { ...values, perPerson: String(values.perPerson) };
    this.tripService.updateTrip(this.tripCode, trip).subscribe({
      next: () => { this.router.navigate(['/'], { queryParams: { updated: this.tripCode } }); },
      error: (error) => {
        this.error = error.error?.message || 'Trip could not be updated. Please try again.';
        this.saving = false;
      }
    });
  }
}
