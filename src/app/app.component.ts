import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private api: ApiService, private auth: AuthService) {
    this.api.getClientToken().subscribe({
      next: r => this.auth.saveClientToken(r.access_token),
    });
  }
}
