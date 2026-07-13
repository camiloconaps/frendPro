import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage implements OnInit {

  todasLasVisitas: any[] = [];
  cargando = false;
  medico: any = null;
  clientToken = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.medico      = this.auth.getMedico();
    this.clientToken = this.auth.getClientToken() ?? '';
    this.cargar();
  }

  ionViewWillEnter(): void { this.cargar(); }

  cargar(event?: any): void {
    if (!this.medico?.id) return;
    if (!event) this.cargando = true;

    // Carga todas sin filtro de estado
    this.api.getMisVisitas(this.clientToken, this.medico.id).subscribe({
      next: r => {
        this.todasLasVisitas = (r.dtObject ?? []).sort((a: any, b: any) =>
          (b.fechaCreacion ?? '').localeCompare(a.fechaCreacion ?? '')
        );
        this.cargando = false;
        event?.target?.complete();
      },
      error: () => { this.cargando = false; event?.target?.complete(); },
    });
  }

  pendientes(): any[] {
    return this.todasLasVisitas.filter(v => v.estadoMedico === 'pendiente_medico');
  }

  irAgenda(): void {
    this.router.navigate(['/tabs/agenda']);
  }

  icono(estado: string): string {
    if (estado === 'pendiente_medico') return 'time-outline';
    if (estado === 'aceptado')         return 'checkmark-circle-outline';
    return 'close-circle-outline';
  }

  colorIcono(estado: string): string {
    if (estado === 'pendiente_medico') return '#f59e0b';
    if (estado === 'aceptado')         return '#22c55e';
    return '#ef4444';
  }

  etiqueta(estado: string): string {
    const m: any = { pendiente_medico: 'Solicitud recibida', aceptado: 'Visita confirmada', rechazado: 'Solicitud rechazada' };
    return m[estado] ?? estado;
  }
}
