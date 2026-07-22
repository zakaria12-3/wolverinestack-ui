import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BodyMeasurementDto {
  id?: number;
  date?: string;
  weightKg?: number;
  bodyFatPercent?: number;
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  thighsCm?: number;
  hipsCm?: number;
  notes?: string;
}

export interface MeasurementSummaryDto {
  hasData: boolean;
  latestDate?: string;
  weightKg?: number;
  bodyFatPercent?: number;
  waistCm?: number;
  chestCm?: number;
  weightChangeKg?: number;
  bodyFatChange?: number;
  measurements?: BodyMeasurementDto[];
}

@Injectable({ providedIn: 'root' })
export class MeasurementsService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  logMeasurement(measurement: BodyMeasurementDto): Observable<any> {
    return this.http.post(`${this.API}/member/measurements`, measurement, { headers: this.getHeaders() });
  }

  getMeasurements(): Observable<BodyMeasurementDto[]> {
    return this.http.get<BodyMeasurementDto[]>(`${this.API}/member/measurements`, { headers: this.getHeaders() });
  }

  getMeasurementSummary(): Observable<MeasurementSummaryDto> {
    return this.http.get<MeasurementSummaryDto>(`${this.API}/member/measurements/summary`, { headers: this.getHeaders() });
  }

  deleteMeasurement(id: number): Observable<any> {
    return this.http.delete(`${this.API}/member/measurements/${id}`, { headers: this.getHeaders() });
  }
}
