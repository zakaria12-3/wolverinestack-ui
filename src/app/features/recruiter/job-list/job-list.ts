import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-job-list',
  imports: [
    NgIf
  ],
  standalone:true,
  templateUrl: './job-list.html',
  styleUrl: './job-list.css',
})
export class JobList {
  job: any;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.http.get(`http://localhost:8027/recruiter/jobs/${id}`)
      .subscribe(res => this.job = res);
  }

}
