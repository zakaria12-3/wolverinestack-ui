import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideInfo } from '@ng-icons/lucide';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [HlmAlertImports, FormsModule, NgIf],
  templateUrl: './verify.html',
  styleUrl: './verify.css',
  providers: [provideIcons({ lucideCircleCheck, lucideInfo })],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  animations: [
    trigger('fadePopup', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class Verify {

  user = {
    email: '',
    verificationCode: ''
  };

  showPopup = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    this.route.queryParams.subscribe(params => {
      this.user.email = params['email'] || '';

      // 🔴 FIX: handle missing email
      if (!this.user.email) {
        this.toastr.error('Missing email. Please sign up again.');
        this.router.navigate(['/signup']);
        return;
      }

      // popup animation
      this.showPopup = true;
      setTimeout(() => this.showPopup = false, 2000);
    });
  }

  onSubmit(form: any) {
    if (!form.valid) return;

    const payload = {
      email: this.user.email,
      verificationCode: String(this.user.verificationCode)
    };

    console.log("VERIFY PAYLOAD:", payload);

    this.http.post('http://localhost:8027/auth/verify', payload,{responseType: 'text'})

      .subscribe({
        next: () => {
          this.toastr.success('Account verified!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.log("VERIFY ERROR:", err);
          this.toastr.error(err.error || 'Invalid or expired code');
        }
      });
  }

  onResendCode() {
    if (!this.user.email) {
      this.toastr.error('No email found. Please sign up again.');
      this.router.navigate(['/signup']);
      return;
    }

    this.http.post('http://localhost:8027/auth/resend', {
      email: this.user.email
    }).subscribe({
      next: () => {
        this.showPopup = true;
        setTimeout(() => this.showPopup = false, 4000);
      },
      error: (err) => {
        console.log("RESEND ERROR:", err);
        this.toastr.error('Failed: ' + (err.error || 'Unknown error'));
      }
    });
  }
}
