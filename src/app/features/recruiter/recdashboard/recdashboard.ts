import { Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule, NgFor} from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-recdashboard',
  imports: [CommonModule, NgFor, RouterLink],
  standalone:true,
  templateUrl: './recdashboard.html',
  styleUrl: './recdashboard.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
})
export class Recdashboard implements OnInit {

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
  }


  jobs: any[] = [];


  ngOnInit() {
    this.http.get('http://localhost:8027/recruiter/jobs')
      .subscribe((data: any) => {
        this.jobs = data;
        this.cdr.detectChanges();
      });
  }


  editJob(id: number) {
    this.router.navigate(['/recruiter/edit-job', id]);
  }
  createQuiz(jobId: number) {
    this.router.navigate(['/quiz-create', jobId]);
  }

  deleteJob(id: number) {
    const token = localStorage.getItem('token');

    this.http.delete(
      `http://localhost:8027/recruiter/jobs/${id}`,

    ).subscribe(() => {
      this.jobs = this.jobs.filter(j => j.id !== id);
    });
  }
  selectedJobId: number | null = null;
  showPopup = false;

  openDeletePopup(id: number) {
    this.selectedJobId = id;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  confirmDelete() {
    if (!this.selectedJobId) return;

    this.http.delete(`http://localhost:8027/recruiter/jobs/${this.selectedJobId}`,{ responseType: 'text'})
      .subscribe({
        next: () => {
          this.jobs = this.jobs.filter(j => j.id !== this.selectedJobId);
          this.showPopup = false;
        },
        error: () => {
          this.toastr.error("❌ Not allowed");
        }
      });
  }
  viewApplications(jobId: number) {
    this.router.navigate(['/recruiter/jobs', jobId, 'applications']);
  }









}
