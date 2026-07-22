import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ExerciseLibraryService {
  private readonly apiUrl = 'https://wger.de/api/v2/exerciseinfo/';

  private readonly fallbackExercises: ExerciseLibraryItem[] = [
    {
      id: 'manual-push-up',
      name: 'Push-up',
      description: 'Bodyweight press from a plank position with controlled lowering and full arm extension.',
      muscleGroup: 'Chest',
      equipment: 'Bodyweight',
      imageUrl: ''
    },
    {
      id: 'manual-squat',
      name: 'Bodyweight Squat',
      description: 'Lower the hips back and down, keep the chest tall, then drive through the feet to stand.',
      muscleGroup: 'Legs',
      equipment: 'Bodyweight',
      imageUrl: ''
    },
    {
      id: 'manual-plank',
      name: 'Forearm Plank',
      description: 'Hold a straight line from shoulders to ankles while bracing the core.',
      muscleGroup: 'Core',
      equipment: 'Bodyweight',
      imageUrl: ''
    }
  ];

  constructor(private http: HttpClient) {}

  searchExercises(query = ''): Observable<ExerciseLibraryItem[]> {
    const term = encodeURIComponent(query.trim());
    const url = `${this.apiUrl}?language=2&limit=24${term ? `&term=${term}` : ''}`;

    return this.http.get<any>(url).pipe(
      map(response => this.mapResults(response?.results || [])),
      map(results => results.length ? results : this.filterFallback(query)),
      catchError(() => of(this.filterFallback(query)))
    );
  }

  private mapResults(results: any[]): ExerciseLibraryItem[] {
    return results
      .map(item => {
        const image = (item.images || []).find((img: any) => img?.image)?.image || '';
        const muscles = [
          ...(item.muscles || []).map((muscle: any) => muscle?.name),
          ...(item.muscles_secondary || []).map((muscle: any) => muscle?.name)
        ].filter(Boolean);
        const equipment = (item.equipment || []).map((piece: any) => piece?.name).filter(Boolean);

        return {
          id: String(item.id),
          name: item.name || 'Exercise',
          description: this.stripHtml(item.description || ''),
          muscleGroup: muscles.join(', ') || item.category?.name || 'General',
          equipment: equipment.join(', ') || 'Bodyweight',
          imageUrl: image
        };
      })
      .filter(item => item.name && item.description);
  }

  private filterFallback(query: string): ExerciseLibraryItem[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.fallbackExercises;
    }
    return this.fallbackExercises.filter(item =>
      item.name.toLowerCase().includes(normalized) ||
      item.muscleGroup.toLowerCase().includes(normalized) ||
      item.equipment.toLowerCase().includes(normalized)
    );
  }

  private stripHtml(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
