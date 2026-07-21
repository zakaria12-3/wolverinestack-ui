import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {JobService} from '../../../core/services/job.service';
import {CommonModule, NgFor} from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {Router} from '@angular/router';
import {animate, style, transition, trigger} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-candashboard',
  imports: [NgFor,CommonModule],
  templateUrl: './candashboard.html',
  standalone:true,
  styleUrl: './candashboard.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class Candashboard implements OnInit{
  jobs: any[] = [];
  private dummyFile: any;



constructor(

  private router: Router,
  private http: HttpClient,
  private jobService: JobService,
  private cdr: ChangeDetectorRef,
  private toastr: ToastrService
) {}

  ngOnInit() {

      this.loadJobs();

  }

  loadJobs() {
    this.http.get<any[]>('http://localhost:8027/candidate/jobs').subscribe(res => {
      this.jobs = res;
      this.cdr.detectChanges();
    });
  }
  selectedFile!: File;


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  apply(jobId: number) {
    const formData = new FormData();

    formData.append('jobId', jobId.toString());
    formData.append('score', '0');

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    } else {
      this.toastr.error("Please select a file first");
      return;
    }

    this.http.post('http://localhost:8027/candidate/apply', formData)
      .subscribe({
        next: (response: any) => {const job = this.jobs.find(j => j.id === jobId);
          if (job) job.applied = true;
          if (response.quizPassed === false) {
            this.toastr.info("Applied successfully! You will now be redirected to the required quiz.");
            this.router.navigate(['/quizpass', jobId]);
          } else {
            this.toastr.success("Applied successfully!");
          }
        },
        error: err => {
          if (err.status === 400 && err.error === "You already applied to this job") {
            this.toastr.warning("You already applied to this job.");
          } else {
            console.error("ERROR:", err);
            this.toastr.error("Something went wrong");
          }
        }
      });
  }
}
