import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-body-measurements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurements.html',
  styleUrls: ['./measurements.css']
})
export class BodyMeasurements implements OnInit {
  measurements: any[] = [];
  summary: any = null;
  isLoading = false;
  showForm = false;

  newMeasurement = {
    weightKg: null as number | null,
    bodyFatPercent: null as number | null,
    waistCm: null as number | null,
    chestCm: null as number | null,
    armsCm: null as number | null,
    thighsCm: null as number | null,
    hipsCm: null as number | null,
    notes: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/member/measurements/summary`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.summary = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(this.errorMessage(err, 'Failed to load measurement summary'));
        }
      });

    this.http.get(`${environment.apiUrl}/member/measurements`, this.getHeaders())
      .subscribe({
        next: (data: any) => {
          this.measurements = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to load measurements'))
      });
  }

  saveMeasurement() {
    if (!this.newMeasurement.weightKg) {
      this.toastr.error('Weight is required');
      return;
    }

    this.isLoading = true;
    this.http.post(`${environment.apiUrl}/member/measurements`, this.newMeasurement, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.success('Measurement saved! 📏');
          this.showForm = false;
          this.newMeasurement = {
            weightKg: null, bodyFatPercent: null, waistCm: null, chestCm: null,
            armsCm: null, thighsCm: null, hipsCm: null, notes: ''
          };
          this.loadData();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(this.errorMessage(err, 'Failed to save'));
        }
      });
  }

  deleteMeasurement(id: number) {
    this.http.delete(`${environment.apiUrl}/member/measurements/${id}`, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.info('Measurement removed');
          this.loadData();
        },
        error: (err) => this.toastr.error(this.errorMessage(err, 'Failed to delete'))
      });
  }

  getChangeClass(value: number | undefined | null, reverse = false): string {
    if (!value) return '';
    if (reverse) return value < 0 ? 'text-green-400' : 'text-red-400';
    return value > 0 ? 'text-green-400' : 'text-red-400';
  }

  private errorMessage(err: any, fallback: string): string {
    return typeof err?.error === 'string' ? err.error : err?.error?.message || fallback;
  }
}
