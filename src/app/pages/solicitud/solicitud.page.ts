import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-solicitud',
  templateUrl: './solicitud.page.html',
  styleUrls: ['./solicitud.page.scss'],
  standalone: false,
})
export class SolicitudPage implements OnInit {

  form = {
    nombre:          '',
    especialidad:    '',
    licencia:        '',
    email:           '',
    telefono:        '',
    ciudad:          '',
    experienciaAnios: null as number | null,
    mensaje:         '',
  };

  especialidades = [
    'Cardiología veterinaria',
    'Dermatología veterinaria',
    'Oncología veterinaria',
    'Oftalmología veterinaria',
    'Odontología veterinaria',
    'Anestesiología veterinaria',
    'Cirugía ortopédica',
    'Neurología veterinaria',
    'Animales exóticos',
    'Ecografía / diagnóstico por imagen',
    'Rehabilitación animal',
    'Nutrición clínica',
    'Medicina alternativa / acupuntura',
    'Etología y comportamiento',
    'Otra especialidad',
  ];

  enviado = false;
  clientToken = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  ) {}

  ngOnInit(): void {
    this.api.getClientToken().subscribe({
      next: r => { this.clientToken = r.access_token; },
    });
  }

  get valido(): boolean {
    const f = this.form;
    return !!(f.nombre && f.especialidad && f.email && f.telefono && f.ciudad);
  }

  async enviar(): Promise<void> {
    if (!this.valido) return;

    const loading = await this.loadingCtrl.create({ message: 'Enviando solicitud…' });
    await loading.present();

    this.api.enviarSolicitud(this.clientToken, this.form).subscribe({
      next: async r => {
        await loading.dismiss();
        if (r.message === 'OK' || r.message === 'CREATED') {
          this.enviado = true;
        } else {
          this.showAlert('No se pudo enviar', r.message);
        }
      },
      error: async err => {
        await loading.dismiss();
        const msg = err?.error?.message ?? 'Error de conexión. Intenta de nuevo.';
        this.showAlert('Error', msg);
      },
    });
  }

  irLogin(): void {
    this.router.navigate(['/login']);
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }
}
