import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class TrainerDashboard implements OnInit {
  stats = { totalClients: 0, activePlans: 0, totalSessions: 0 };
  clients: any[] = [];
  plans: any[] = [];
  recentSessions: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.http.get('http://localhost:8027/trainer/clients', this.getHeaders())
      .subscribe((data: any) => {
        this.clients = data || [];
        this.stats.totalClients = this.clients.length;
        this.cdr.detectChanges();
      });

    this.http.get('http://localhost:8027/member/plans', this.getHeaders())
      .subscribe((data: any) => {
        this.plans = data || [];
        this.stats.activePlans = this.plans.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }
}
