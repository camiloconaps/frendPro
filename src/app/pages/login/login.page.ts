import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  email    = '';
  password = '';
  showPass = false;
  clientToken = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
      return;
    }
    this.api.getClientToken().subscribe({
      next: r => {
        this.clientToken = r.access_token;
        this.auth.saveClientToken(r.access_token);
      },
    });
  }

  async iniciarSesion(): Promise<void> {
    if (!this.email || !this.password) return;

    const loading = await this.loadingCtrl.create({ message: 'Verificando…' });
    await loading.present();

    this.api.loginMedico(this.clientToken, this.email.trim().toLowerCase(), this.password).subscribe({
      next: async r => {
        await loading.dismiss();
        if (r.message === 'OK' && r.dtObject) {
          this.auth.saveMedico(r.dtObject);
          this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
        } else {
          this.showAlert('Acceso denegado', r.message);
        }
      },
      error: async err => {
        await loading.dismiss();
        const msg = err?.error?.message ?? 'Usuario o contraseña incorrectos.';
        this.showAlert('Error', msg);
      },
    });
  }

  irSolicitud(): void {
    this.router.navigate(['/solicitud']);
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }
}
