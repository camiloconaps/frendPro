import { Component } from '@angular/core';

@Component({
  selector: 'app-agenda',
  standalone: false,
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary"><ion-title>Agenda</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div style="text-align:center;padding:60px 0;color:#94a3b8;">
        <ion-icon name="calendar-outline" style="font-size:56px;display:block;margin-bottom:12px;"></ion-icon>
        <h3 style="color:#475569;font-weight:700;">Próximas visitas</h3>
        <p style="font-size:13px;">Aquí verás las consultas agendadas por veterinarias. <br>Disponible en la próxima fase.</p>
      </div>
    </ion-content>
  `,
})
export class AgendaPage {}
