import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../../guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: TabsPage,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'inicio',
            loadChildren: () => import('../inicio/inicio.module').then(m => m.InicioPageModule),
          },
          {
            path: 'agenda',
            loadChildren: () => import('../agenda/agenda.module').then(m => m.AgendaPageModule),
          },
          {
            path: 'notificaciones',
            loadChildren: () => import('../notificaciones/notificaciones.module').then(m => m.NotificacionesPageModule),
          },
          { path: '', redirectTo: 'inicio', pathMatch: 'full' },
        ],
      },
    ]),
  ],
  declarations: [TabsPage],
})
export class TabsPageModule {}
