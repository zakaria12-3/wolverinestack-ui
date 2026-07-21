import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {animate, style, transition, trigger} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './quiz-pass.html',
  styleUrl: './quiz-pass.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class QuizPass implements OnInit {

  jobId!: number;
  quiz: any=null;
  answers: { [key: number]: string } = {};


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}



  ngOnInit() {
    const jobId = this.route.snapshot.paramMap.get('id');

    this.http.get(`http://localhost:8027/candidate/jobs/${jobId}/quiz`)
      .subscribe({
        next: (res: any) => {
          console.log("QUIZ RECEIVED:", res);
          this.quiz = res;
          this.cdr.detectChanges();
          setTimeout(() => {
            console.log("AFTER SET:", this.quiz);
          }, 1000);
        },
        error: (err) => console.error(err)

      });
  }


  selectAnswer(questionId: number, answer: string) {
    this.answers[questionId] = answer;
  }

  submitQuiz() {
    const jobId = this.route.snapshot.paramMap.get('id');
    this.http.post(
      `http://localhost:8027/candidate/jobs/${jobId}/quiz/submit`,
      this.answers
    ).subscribe((score: any) => {

      console.log("Score:", score);

      if (score >= this.quiz.passingScore) {
        this.router.navigate(['/quizresult', jobId, score]);
      } else {
        this.toastr.error("You failed the quiz");
      }

    });
  }
}
