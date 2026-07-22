import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideInfo } from '@ng-icons/lucide';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { VerificationMailService } from '../../core/services/verification-mail.service';

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
  ]
})
export class Verify {

  user = {
    email: '',
    verificationCode: ''
  };

  showPopup = false;
  isResending = false;
  resendCooldown = 0;
  private cooldownTimer?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private verificationMail: VerificationMailService
  ) {
    this.route.queryParams.subscribe(params => {
      const email = params['email'] || localStorage.getItem('verifyEmail') || '';
      this.user.email = email.trim().toLowerCase();

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

    this.verificationMail.verifyCode(payload.email, payload.verificationCode)

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
    if (!this.user.email || this.isResending || this.resendCooldown > 0) {
      if (this.resendCooldown > 0) {
        this.toastr.info(`Please wait ${this.resendCooldown}s before resending.`);
        return;
      }
      this.toastr.error('No email found. Please sign up again.');
      this.router.navigate(['/signup']);
      return;
    }

    this.isResending = true;
    this.verificationMail.sendVerificationCode(this.user.email).subscribe({
      next: () => {
        this.isResending = false;
        this.toastr.success('Verification code sent.');
        this.showPopup = true;
        this.startCooldown();
        setTimeout(() => this.showPopup = false, 4000);
      },
      error: (err) => {
        this.isResending = false;
        console.log("RESEND ERROR:", err);
        this.toastr.error('Failed: ' + (err.error || 'Unknown error'));
      }
    });
  }

  private startCooldown(): void {
    this.resendCooldown = 60;
    if (this.cooldownTimer) {
      window.clearInterval(this.cooldownTimer);
    }
    this.cooldownTimer = window.setInterval(() => {
      this.resendCooldown = Math.max(0, this.resendCooldown - 1);
      if (this.resendCooldown === 0 && this.cooldownTimer) {
        window.clearInterval(this.cooldownTimer);
      }
    }, 1000);
  }
}
