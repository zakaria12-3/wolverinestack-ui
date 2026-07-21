import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import {RouterLink} from '@angular/router';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'app-signupcorp',
  imports: [FormsModule,RouterLink,HlmSkeletonImports],
  templateUrl: './signupcorp.html',
  styleUrl: './signupcorp.css',
  animations:[
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
})
export class Signupcorp {
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role:'RECRUITER'
  };

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form Submitted:', this.user);
    }
  }
}






