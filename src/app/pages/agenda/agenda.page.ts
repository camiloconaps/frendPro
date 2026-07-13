import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BadgeService } from '../../services/badge.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: false,
})
export class AgendaPage implements OnInit {

  visitas: any[]   = [];
  cargando         = false;
  filtro: string   = 'pendiente_medico';
  medico: any      = null;
  clientToken      = '';

  /* modal rechazo */
  dlgRechazar      = false;
  visitaEnRechazo: any = null;
  motivoRechazo    = '';
  procesando       = false;

  filtros = [
    { label: 'Pendientes',  value: 'pendiente_medico', color: 'warning' },
    { label: 'Aceptadas',   value: 'aceptado',          color: 'success' },
    { label: 'Rechazadas',  value: 'rechazado',          color: 'danger'  },
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private badge: BadgeService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  ) {}

  ngOnInit(): void {
    this.medico      = this.auth.getMedico();
    this.clientToken = this.auth.getClientToken() ?? '';
    this.cargar();
  }

  ionViewWillEnter(): void {
    this.cargar();
  }

  async cargar(event?: any): Promise<void> {
    if (!this.medico?.id) return;
    if (!event) this.cargando = true;

    this.api.getMisVisitas(this.clientToken, this.medico.id, this.filtro).subscribe({
      next: r => {
        this.visitas = r.dtObject ?? [];
        this.cargando = false;
        event?.target?.complete();
      },
      error: () => { this.cargando = false; event?.target?.complete(); },
    });
  }

  cambiarFiltro(v: string): void {
    this.filtro = v;
    this.cargar();
  }

  pendientesCount(): number {
    return this.filtro === 'pendiente_medico' ? this.visitas.length : 0;
  }

  // ── Aceptar ────────────────────────────────────────────────────────────────

  async aceptar(visita: any): Promise<void> {
    const a = await this.alertCtrl.create({
      header: '¿Confirmar visita?',
      message: `Aceptar solicitud del ${visita.fechaVisita} a las ${visita.horaInicio}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aceptar',
          handler: () => this.confirmarDecision(visita.id, 'aceptado', ''),
        },
      ],
    });
    await a.present();
  }

  // ── Rechazar ───────────────────────────────────────────────────────────────

  abrirRechazo(visita: any): void {
    this.visitaEnRechazo = visita;
    this.motivoRechazo   = '';
    this.dlgRechazar     = true;
  }

  async confirmarRechazo(): Promise<void> {
    if (!this.motivoRechazo.trim()) return;
    this.dlgRechazar = false;
    await this.confirmarDecision(
      this.visitaEnRechazo.id,
      'rechazado',
      this.motivoRechazo.trim(),
    );
  }

  private async confirmarDecision(id: number, decision: string, motivo: string): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: decision === 'aceptado' ? 'Confirmando…' : 'Rechazando…' });
    await loading.present();

    this.api.responderVisita(this.clientToken, id, decision, motivo || undefined).subscribe({
      next: async () => {
        await loading.dismiss();
        this.badge.refrescar();
        this.cargar();
        const msg = decision === 'aceptado'
          ? 'Visita confirmada. La veterinaria recibirá la notificación.'
          : 'Solicitud rechazada.';
        const toast = await this.alertCtrl.create({
          header: decision === 'aceptado' ? '¡Confirmado!' : 'Rechazada',
          message: msg,
          buttons: ['OK'],
        });
        await toast.present();
      },
      error: async () => {
        await loading.dismiss();
        const e = await this.alertCtrl.create({ header: 'Error', message: 'No se pudo procesar. Intenta de nuevo.', buttons: ['OK'] });
        await e.present();
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  etiquetaEstado(e: string): string {
    const m: any = { pendiente_medico: 'Pendiente', aceptado: 'Aceptado', rechazado: 'Rechazado' };
    return m[e] ?? e;
  }

  colorEstado(e: string): string {
    const m: any = { pendiente_medico: 'warning', aceptado: 'success', rechazado: 'danger' };
    return m[e] ?? 'medium';
  }

  formatTarifa(t: number | undefined): string {
    if (!t) return '—';
    return '$' + t.toLocaleString('es-CO');
  }
}
