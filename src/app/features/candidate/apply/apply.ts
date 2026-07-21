import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply.html',
})
export class ApplyComponent implements OnInit {

  jobId: string | null = null;

  answers = {
    question1: '',
    question2: '',
    cv: null as File | null
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.jobId = this.route.snapshot.queryParamMap.get('jobId');
    console.log('Applying for job:', this.jobId);
  }

  onFileSelected(event: any) {
    this.answers.cv = event.target.files[0];
  }


  submit() {
    console.log('Submitting application:', this.answers);

    const formData = new FormData();
    formData.append('jobId', this.jobId || '');
    formData.append('q1', this.answers.question1);
    formData.append('q2', this.answers.question2);
    if (this.answers.cv) {
      formData.append('cv', this.answers.cv);
    }


    // this.http.post('/applications', formData).subscribe(...)
  }
}
