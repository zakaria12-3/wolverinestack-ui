import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-trainer-clients',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clients.html',
  styleUrls: ['./clients.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class TrainerClients implements OnInit {
  clients: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/trainer/clients`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.clients = data || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Failed to load clients');
        }
      });
  }

  getGoalIcon(goal: string): string {
    switch (goal) {
      case 'LOSE_WEIGHT': return '🔥';
      case 'BUILD_MUSCLE': return '💪';
      case 'GAIN_WEIGHT': return '📈';
      case 'GENERAL_FITNESS': return '🌟';
      default: return '🎯';
    }
  }
}
