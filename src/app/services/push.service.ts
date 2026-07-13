import { Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PushService {

  constructor(private api: ApiService, private auth: AuthService) {}

  async inicializar(): Promise<void> {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', (t: Token) => {
      this.registrarToken(t.value);
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('[Push] Error registro:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('[Push] Recibida:', notification.title);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('[Push] Acción:', action.actionId);
    });
  }

  private registrarToken(fcmToken: string): void {
    const medico = this.auth.getMedico();
    const clientToken = this.auth.getClientToken();
    if (!medico?.id || !clientToken) return;

    this.api.saveTokenMedico(clientToken, medico.id, fcmToken).subscribe({
      next: () => console.log('[Push] Token registrado para médico', medico.id),
      error: e  => console.error('[Push] Error guardando token:', e),
    });
  }
}
