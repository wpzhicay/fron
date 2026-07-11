import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DeviceStatusComponent } from '../device-status/device-status.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DeviceStatusComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  status: string = '';
  panelsCount: number = 0;
  usersCount: number = 0;
  loading: boolean = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    Promise.all([
      this.apiService.healthCheck(),
      this.apiService.getSolarPanels(),
      this.apiService.getUsers()
    ]).then(([health, panels, users]: any[]) => {
      this.status = health.data.status;
      this.panelsCount = panels.data.length;
      this.usersCount = users.data.length;
      this.loading = false;
    }).catch(err => {
      console.error('Error loading dashboard:', err);
      this.loading = false;
    });
  }
}
