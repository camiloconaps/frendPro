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
    { label: 'Realizadas',  value: 'realizada',          color: 'primary' },
    { label: 'Rechazadas',  value: 'rechazado',          color: 'danger'  },
    { label: 'Canceladas',  value: 'cancelada_vet,cancelada_cliente', color: 'medium' },
  ];

  /* modal realizar visita */
  dlgRealizar      = false;
  visitaEnGestion: any = null;
  antecedentes     = '';
  diagnostico      = '';
  formula          = '';
  obsGestion       = '';
  procesandoGestion = false;

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

    // "cancelada_vet,cancelada_cliente" se manda como un solo estado (el backend maneja uno a la vez),
    // para canceladas cargamos ambas en dos llamadas y concatenamos
    if (this.filtro.includes(',')) {
      const [e1, e2] = this.filtro.split(',');
      let r1: any[] = [], r2: any[] = [], done = 0;
      const finish = () => {
        if (++done === 2) {
          this.visitas = [...r1, ...r2];
          this.cargando = false;
          event?.target?.complete();
        }
      };
      this.api.getMisVisitas(this.clientToken, this.medico.id, e1).subscribe({
        next: r => { r1 = r.dtObject ?? []; finish(); },
        error: () => finish(),
      });
      this.api.getMisVisitas(this.clientToken, this.medico.id, e2).subscribe({
        next: r => { r2 = r.dtObject ?? []; finish(); },
        error: () => finish(),
      });
    } else {
      this.api.getMisVisitas(this.clientToken, this.medico.id, this.filtro).subscribe({
        next: r => {
          this.visitas = r.dtObject ?? [];
          this.cargando = false;
          event?.target?.complete();
        },
        error: () => { this.cargando = false; event?.target?.complete(); },
      });
    }
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

  // ── Realizar visita ────────────────────────────────────────────────────────

  abrirRealizar(visita: any): void {
    this.visitaEnGestion  = visita;
    this.antecedentes     = '';
    this.diagnostico      = '';
    this.formula          = '';
    this.obsGestion       = '';
    this.dlgRealizar      = true;
  }

  async confirmarRealizar(): Promise<void> {
    this.dlgRealizar = false;
    const loading = await this.loadingCtrl.create({ message: 'Guardando gestión…' });
    await loading.present();

    this.api.realizarVisita(this.clientToken, this.visitaEnGestion.id, {
      antecedentes: this.antecedentes || undefined,
      diagnostico:  this.diagnostico  || undefined,
      formula:      this.formula       || undefined,
      obs:          this.obsGestion    || undefined,
    }).subscribe({
      next: async () => {
        await loading.dismiss();
        this.badge.refrescar();
        this.cargar();
        const t = await this.alertCtrl.create({
          header: '¡Visita registrada!',
          message: 'La gestión fue guardada. La visita ya puede incluirse en la liquidación mensual.',
          buttons: ['OK'],
        });
        await t.present();
      },
      error: async () => {
        await loading.dismiss();
        const e = await this.alertCtrl.create({ header: 'Error', message: 'No se pudo registrar la visita. Intenta de nuevo.', buttons: ['OK'] });
        await e.present();
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  etiquetaEstado(e: string): string {
    const m: any = {
      pendiente_medico: 'Pendiente',
      aceptado:         'Aceptada',
      realizada:        'Realizada',
      rechazado:        'Rechazada',
      cancelada_vet:    'Cancelada (vet)',
      cancelada_cliente:'Cancelada (cliente)',
    };
    return m[e] ?? e;
  }

  colorEstado(e: string): string {
    const m: any = {
      pendiente_medico: 'warning',
      aceptado:         'success',
      realizada:        'primary',
      rechazado:        'danger',
      cancelada_vet:    'medium',
      cancelada_cliente:'medium',
    };
    return m[e] ?? 'medium';
  }

  formatTarifa(t: number | undefined): string {
    if (!t) return '—';
    return '$' + t.toLocaleString('es-CO');
  }

  esNumero(val: any): boolean {
    return val !== null && val !== '' && !isNaN(Number(val));
  }
}
