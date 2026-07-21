import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {animate, style, transition, trigger} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
}
@Component({
  selector: 'app-quiz-create',
  imports: [
    FormsModule,
    NgForOf
  ],
  standalone:true,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './quiz-create.html',
  styleUrl: './quiz-create.css',
})


export class QuizCreate implements OnInit {
  quiz: {
    jobId: number | null;
    passingScore: number;
    questions: Question[];
  } = {
    jobId: null,
    passingScore: 50,
    questions: []
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
  }
  ngOnInit() {
    const jobId = this.route.snapshot.paramMap.get('jobId');

    this.quiz.jobId = jobId ? +jobId : null;
  }

  addQuestion() {
    this.quiz.questions.push({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
  }

  createQuiz() {

    const formattedQuestions = this.quiz.questions.map(q => ({
      questionText: q.text,
      optionA: q.options[0],
      optionB: q.options[1],
      optionC: q.options[2],
      optionD: q.options[3],
      correctAnswer: q.correctAnswer
    }));

    const payload = {
      jobId: this.quiz.jobId,
      passingScore: this.quiz.passingScore,
      questions: formattedQuestions
    };

    this.http.post('https://wolverinestack-api.onrender.com/recruiter/quiz', payload)
      .subscribe({
        next: () => {
          this.toastr.success("Quiz created!");
          this.router.navigate(['/recruiter']);
        },
        error: err => {
          console.error(err);
          this.toastr.error("Failed to create quiz");
        }
      });
  }
}
