import {ChangeDetectorRef, Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-job-create',
  imports: [CommonModule, FormsModule, RouterLink],
  standalone:true,
  templateUrl: './job-create.html',
  styleUrl: './job-create.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
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
    this.http.post('https://wolverinestack-api.onrender.com/recruiter/jobs', this.job)
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
