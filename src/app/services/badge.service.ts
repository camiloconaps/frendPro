import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BadgeService {

  pendientes$ = new BehaviorSubject<number>(0);

  constructor(private api: ApiService, private auth: AuthService) {}

  refrescar(): void {
    const medico      = this.auth.getMedico();
    const clientToken = this.auth.getClientToken();
    if (!medico?.id || !clientToken) return;

    this.api.getMisVisitas(clientToken, medico.id, 'pendiente_medico').subscribe({
      next: r => this.pendientes$.next((r.dtObject ?? []).length),
      error: () => {},
    });
  }
}
