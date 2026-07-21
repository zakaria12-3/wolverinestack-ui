import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {animate, style, transition, trigger} from '@angular/animations';
export interface Application {
  id: number;
  candidateName: string;
  status: string;
  score: number;
  quizPassed: boolean;
  cvUrl: string;
  jobTitle?: string;
}

@Component({
  selector: 'app-applications',
  imports: [NgForOf, NgIf, NgClass],
  standalone:true,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {
  jobId!: number;
  cvUrl?: SafeResourceUrl;
  selectedCv: boolean = false;
  applications: Application[] = [];
  job: { id: number; title: string } = { id: 0, title: '' };
  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {
  }


    ngOnInit() {
      this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));

      this.http.get(`http://localhost:8027/recruiter/jobs/${this.jobId}/applications`)
        .subscribe((data: any) => {
          this.applications = data;

          this.cdr.detectChanges();
        });
    }
  closeCv() {
    this.selectedCv = false;
    this.cvUrl = undefined;
  }
  viewCv(url: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe(res => {
      const fileURL = URL.createObjectURL(res);
      this.cvUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      this.selectedCv = true;
    });
  }

  loadApplications() {
    this.http.get(`http://localhost:8027/recruiter/jobs/${this.jobId}/applications`)
      .subscribe((data: any) => {
        this.applications = data;
      });
  }


  accept(id: number) {
    this.http.put(
      `http://localhost:8027/recruiter/applications/${id}/status`,
      null,
      { params: { status: 'ACCEPTED' } }
    ).subscribe(() => this.loadApplications());
  }

  reject(id: number) {
    this.http.put(
      `http://localhost:8027/recruiter/applications/${id}/status`,
      null,
      { params: { status: 'REJECTED' } }
    ).subscribe(() => this.loadApplications());
  }



}
