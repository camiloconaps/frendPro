import { Injectable } from '@angular/core';

const KEY_MEDICO = 'fp_medico';
const KEY_TOKEN  = 'fp_client_token';

@Injectable({ providedIn: 'root' })
export class AuthService {

  saveMedico(medico: any): void {
    localStorage.setItem(KEY_MEDICO, JSON.stringify(medico));
  }

  getMedico(): any | null {
    const raw = localStorage.getItem(KEY_MEDICO);
    return raw ? JSON.parse(raw) : null;
  }

  saveClientToken(token: string): void {
    localStorage.setItem(KEY_TOKEN, token);
  }

  getClientToken(): string | null {
    return localStorage.getItem(KEY_TOKEN);
  }

  isLoggedIn(): boolean {
    return !!this.getMedico();
  }

  logout(): void {
    localStorage.removeItem(KEY_MEDICO);
  }
}
