import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false,
})
export class InicioPage implements OnInit {

  medico: any = null;
  banners: any[] = [];
  bannerActivo = 0;
  cargandoBanners = true;
  clientToken = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    this.medico = this.auth.getMedico();
    this.clientToken = this.auth.getClientToken() ?? '';
    this.cargarBanners();
  }

  ionViewWillEnter(): void {
    this.medico = this.auth.getMedico();
  }

  cargarBanners(): void {
    this.cargandoBanners = true;
    this.api.getBannersMedico(this.clientToken).subscribe({
      next: r => {
        this.banners = (r.dtObject ?? []).filter((b: any) => b.estado === 'activo');
        this.cargandoBanners = false;
      },
      error: () => { this.cargandoBanners = false; },
    });
  }

  iniciales(): string {
    if (!this.medico?.nombre) return '?';
    return this.medico.nombre.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase();
  }

  formatTarifa(t: number | undefined): string {
    if (!t) return '—';
    return '$' + t.toLocaleString('es-CO');
  }

  async cerrarSesion(): Promise<void> {
    const a = await this.alertCtrl.create({
      header: '¿Cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          handler: () => {
            this.auth.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          },
        },
      ],
    });
    await a.present();
  }
}
