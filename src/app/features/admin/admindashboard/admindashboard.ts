import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admindashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admindashboard.html',
  styleUrl: './admindashboard.css'
})
export class Admindashboard implements OnInit {
  activeTab: 'overview' | 'users' | 'trainers' | 'plans' = 'overview';
  
  users: any[] = [];
  trainers: any[] = [];
  plans: any[] = [];
  
  stats = {
    totalUsers: 0,
    totalTrainers: 0,
    totalPlans: 0
  };

  showConfirmModal = false;
  pendingAction: any = null;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll() {
    this.http.get('http://localhost:8027/admin/users', this.getHeaders()).subscribe((res: any) => {
      this.users = res.filter((u: any) => u.role === 'ROLE_MEMBER' || u.role === 'MEMBER');
      this.trainers = res.filter((u: any) => u.role === 'ROLE_TRAINER' || u.role === 'TRAINER');
      this.stats.totalUsers = this.users.length;
      this.stats.totalTrainers = this.trainers.length;
    });

    this.http.get('http://localhost:8027/member/plans', this.getHeaders()).subscribe((res: any) => {
      this.plans = res || [];
      this.stats.totalPlans = this.plans.length;
    });
  }

  setTab(tab: 'overview' | 'users' | 'trainers' | 'plans') {
    this.activeTab = tab;
  }

  deleteUser(id: number) {
    this.promptConfirm('Are you sure you want to delete this user?', () => {
      this.http.delete(`http://localhost:8027/admin/users/${id}`, this.getHeaders()).subscribe(() => {
        this.refreshAll();
      });
    });
  }

  toggleUserStatus(user: any) {
    const newStatus = !user.enabled;
    this.http.put(`http://localhost:8027/admin/users/${user.id}/status?enabled=${newStatus}`, {}, this.getHeaders()).subscribe(() => {
      user.enabled = newStatus;
    });
  }

  changeRole(user: any, role: string) {
    this.http.put(`http://localhost:8027/admin/users/${user.id}/role?role=${role}`, {}, this.getHeaders()).subscribe(() => {
      user.role = role;
    });
  }

  deletePlan(id: number) {
    this.promptConfirm('Delete this workout plan?', () => {
      this.http.delete(`http://localhost:8027/admin/plans/${id}`, this.getHeaders()).subscribe(() => {
        this.refreshAll();
      });
    });
  }

  promptConfirm(message: string, action: () => void) {
    this.pendingAction = { message, action };
    this.showConfirmModal = true;
  }

  executeConfirm() {
    if (this.pendingAction) {
      this.pendingAction.action();
    }
    this.closeModal();
  }

  closeModal() {
    this.showConfirmModal = false;
    this.pendingAction = null;
  }
}
