import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
@Component({
  selector: 'app-login', standalone: true, imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  error = '';
  saving = false;
  submitted = false;
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  constructor(private readonly fb: FormBuilder, private readonly auth: AuthenticationService,
    private readonly router: Router, private readonly route: ActivatedRoute) {}
  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        const target = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/login') ? target : '/');
      },
      error: error => { this.error = error.error?.message || 'Sign in failed. Please try again.'; this.saving = false; }
    });
  }
}
