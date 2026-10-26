import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from './services/authentication.service';
@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html', styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Travlr Getaways Administration';
  constructor(public readonly auth: AuthenticationService, private readonly router: Router) {}
  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }
}
