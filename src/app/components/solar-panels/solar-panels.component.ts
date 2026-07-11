import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-solar-panels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solar-panels.component.html',
  styleUrls: ['./solar-panels.component.css']
})
export class SolarPanelsComponent implements OnInit {
  panels: any[] = [];
  loading: boolean = true;
  showForm: boolean = false;
  newPanel = { name: '', location: '', capacity: 0 };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPanels();
  }

  loadPanels() {
    this.loading = true;
    this.apiService.getSolarPanels()
      .then((res: any) => {
        this.panels = res.data;
        this.loading = false;
      })
      .catch(err => {
        console.error('Error loading panels:', err);
        this.loading = false;
      });
  }

  createPanel() {
    if (this.newPanel.name && this.newPanel.capacity) {
      this.apiService.createSolarPanel(this.newPanel)
        .then(() => {
          this.newPanel = { name: '', location: '', capacity: 0 };
          this.showForm = false;
          this.loadPanels();
        })
        .catch(err => console.error('Error creating panel:', err));
    }
  }
}
