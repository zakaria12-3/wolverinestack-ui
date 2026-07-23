import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import {RouterLink} from '@angular/router';
import { HttpClient, HttpClientModule} from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-signup',
  imports: [FormsModule,RouterLink,HttpClientModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  standalone:true
  ,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
    })

export class Signup {
  constructor(private https:HttpClient) {
  }
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  onSubmit(form: any) {
    if (form.valid) {
      this.https.post(`${environment.apiUrl}/auth/signup`, this.user)
        .subscribe({
          next: (response) => {
            console.log('Signup successful:', response);
          },
          error: (err) => {
            console.error('Signup failed:', err);
          }
        });
    }
  }
}
