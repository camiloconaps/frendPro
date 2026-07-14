import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResp<T = any> {
  message: string;
  dtObject: T;
}

const BASE = 'https://frend.top';
const PATH = `${BASE}/ApiService_Frend/v1.0`;

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) {}

  private h(token: string) {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }),
    };
  }

  getClientToken(): Observable<any> {
    const url = `${PATH}/oauth/client_credentials/accestoken?grant_type=client_credentials&client_id=frend-ios-b8c3d2e91f05&client_secret=yjikL2Dnmhl1GgVIjr9q0OMiOGkVDHXQ`;
    return this.http.post<any>(url, {}, {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    });
  }

  // ── Auth FrendPro ─────────────────────────────────────────────────────────

  loginMedico(token: string, email: string, password: string): Observable<ApiResp<any>> {
    return this.http.post<ApiResp<any>>(
      `${PATH}/medico/auth/login`,
      { email, password },
      this.h(token),
    );
  }

  // ── Perfil médico ─────────────────────────────────────────────────────────

  getMiPerfil(token: string, id: number): Observable<ApiResp<any>> {
    return this.http.get<ApiResp<any>>(`${PATH}/Fc/medico/${id}`, this.h(token));
  }

  actualizarPerfil(token: string, id: number, cambios: any): Observable<ApiResp<any>> {
    return this.http.post<ApiResp<any>>(`${PATH}/Fc/medico/${id}`, cambios, this.h(token));
  }

  // ── Banners banner_medico ─────────────────────────────────────────────────

  getBannersMedico(token: string): Observable<ApiResp<any[]>> {
    return this.http.get<ApiResp<any[]>>(`${PATH}/Fc/banner?tipoApp=banner_medico`, this.h(token));
  }

  // ── Visitas del especialista (FrendPro) ───────────────────────────────────

  getMisVisitas(token: string, idMedico: number, estado?: string): Observable<ApiResp<any[]>> {
    const q = estado ? `?estado=${estado}` : '';
    return this.http.get<ApiResp<any[]>>(`${PATH}/visita-medico/medico/${idMedico}${q}`, this.h(token));
  }

  responderVisita(token: string, id: number, decision: string, motivoRechazo?: string, notas?: string): Observable<ApiResp<any>> {
    return this.http.post<ApiResp<any>>(`${PATH}/visita-medico/${id}/responder`, { decision, motivoRechazo, notas }, this.h(token));
  }

  realizarVisita(token: string, id: number, notas: { antecedentes?: string; diagnostico?: string; formula?: string; obs?: string }): Observable<ApiResp<any>> {
    return this.http.post<ApiResp<any>>(`${PATH}/visita-medico/${id}/realizar`, notas, this.h(token));
  }

  cancelarVisitaVet(token: string, id: number, motivo: string): Observable<ApiResp<any>> {
    return this.http.post<ApiResp<any>>(`${PATH}/visita-medico/${id}/cancelar-vet`, { motivo }, this.h(token));
  }

  saveTokenMedico(token: string, idMedico: number, fcmToken: string): Observable<ApiResp<any>> {
    return this.http.post<ApiResp<any>>(`${PATH}/visita-medico/token`, { idMedico: idMedico.toString(), token: fcmToken }, this.h(token));
  }

  // ── Solicitud pública de ingreso ──────────────────────────────────────────

  enviarSolicitud(token: string, body: any): Observable<ApiResp<any>> {
    return this.http.post<ApiResp<any>>(`${PATH}/medico/solicitud`, body, this.h(token));
  }
}
