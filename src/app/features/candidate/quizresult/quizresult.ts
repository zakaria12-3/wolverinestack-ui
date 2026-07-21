import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-quizresult',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quizresult.html',
  styleUrl: './quizresult.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class QuizResult implements OnInit {

  score!: number;
  jobId!: number;
  passed = false;

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    this.jobId = Number(window.location.pathname.split('/')[2]);
    this.score = Number(window.location.pathname.split('/')[3]);
    this.passed = this.score >= 1;
  }
}
