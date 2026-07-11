import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpService } from '../../services/ip.service';

@Component({
  selector: 'app-ip-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 text-white text-sm">
      <span class="hidden sm:inline">IP:</span>
      <span class="bg-white bg-opacity-20 px-3 py-1 rounded-lg font-mono">
        {{ clientIp | slice: 0: 50 }}
      </span>
    </div>
  `,
  styles: []
})
export class IpInfoComponent implements OnInit {
  clientIp: string = 'Cargando...';

  constructor(private ipService: IpService) {}

  ngOnInit(): void {
    this.ipService.getClientIpObservable().subscribe(ip => {
      this.clientIp = ip || 'No disponible';
    });
  }
}
