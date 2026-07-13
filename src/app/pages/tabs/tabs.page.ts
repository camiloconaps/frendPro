import { Component, OnInit } from '@angular/core';
import { BadgeService } from '../../services/badge.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: false,
})
export class TabsPage implements OnInit {

  pendientes = 0;

  constructor(private badge: BadgeService) {}

  ngOnInit(): void {
    this.badge.refrescar();
    this.badge.pendientes$.subscribe(n => { this.pendientes = n; });
  }
}
