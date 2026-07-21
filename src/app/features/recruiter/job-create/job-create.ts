import {ChangeDetectorRef, Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-job-create',
  imports: [CommonModule, FormsModule],
  standalone:true,
  templateUrl: './job-create.html',
  styleUrl: './job-create.css',
})
export class JobCreate {
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
  }


  job= {
    title:'',
    company:'',
    location:'',
    description:''

  }
  createJob() {
    this.http.post('http://localhost:8027/recruiter/jobs', this.job)
      .subscribe({
        next: () => {
          this.toastr.success("Job created!");
          this.router.navigate(['/recruiter']);
        },
        error: err => {
          console.error(err);
          this.toastr.error("Failed to create job");
        }
      });
  }
}
