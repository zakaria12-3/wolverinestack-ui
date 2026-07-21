import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-body-measurements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurements.html',
  styleUrls: ['./measurements.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('650ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
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
    this.http.get('http://localhost:8027/measurements/summary', this.getHeaders())
      .subscribe((data: any) => {
        this.summary = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      });

    this.http.get('http://localhost:8027/measurements', this.getHeaders())
      .subscribe((data: any) => {
        this.measurements = data || [];
        this.cdr.detectChanges();
      });
  }

  saveMeasurement() {
    if (!this.newMeasurement.weightKg) {
      this.toastr.error('Weight is required');
      return;
    }

    this.isLoading = true;
    this.http.post('http://localhost:8027/measurements', this.newMeasurement, this.getHeaders())
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
          this.toastr.error(err.error || 'Failed to save');
        }
      });
  }

  deleteMeasurement(id: number) {
    this.http.delete(`http://localhost:8027/measurements/${id}`, this.getHeaders())
      .subscribe({
        next: () => {
          this.toastr.info('Measurement removed');
          this.loadData();
        },
        error: (err) => this.toastr.error(err.error || 'Failed to delete')
      });
  }

  getChangeClass(value: number | undefined | null, reverse = false): string {
    if (!value) return '';
    if (reverse) return value < 0 ? 'text-green-400' : 'text-red-400';
    return value > 0 ? 'text-green-400' : 'text-red-400';
  }
}
