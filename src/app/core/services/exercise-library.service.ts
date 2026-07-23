import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  constructor(private http: HttpClient) {}

  /**
   * Search exercises via the backend proxy (which calls the wger API).
   * This avoids CORS issues and provides cleaned data with proper image URLs.
   */
  searchExercises(query = ''): Observable<ExerciseLibraryItem[]> {
    const params: string[] = [];
    if (query.trim()) params.push(`query=${encodeURIComponent(query.trim())}`);
    params.push('limit=30');

    const url = `${environment.apiUrl}/public/exercises/search?${params.join('&')}`;

    return this.http.get<{ results: any[] }>(url).pipe(
      map(response => this.mapResults(response?.results || [])),
      catchError(() => {
        console.warn('[ExerciseLibrary] Backend proxy failed, using fallback');
        return of(this.filterFallback(query));
      })
    );
  }

  private mapResults(results: any[]): ExerciseLibraryItem[] {
    return results
      .map(item => ({
        id: item.id || String(Math.random()),
        name: item.name || 'Exercise',
        description: item.description || '',
        muscleGroup: item.muscleGroup || 'General',
        equipment: item.equipment || 'Bodyweight',
        imageUrl: item.imageUrl || ''
      }))
      .filter(item => item.name && item.name !== 'Exercise');
  }

  private filterFallback(query: string): ExerciseLibraryItem[] {
    const fallbacks: ExerciseLibraryItem[] = [
      {
        id: 'fb-push-up',
        name: 'Push-up',
        description: 'Bodyweight press from a plank position with controlled lowering and full arm extension.',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'fb-squat',
        name: 'Bodyweight Squat',
        description: 'Lower the hips back and down, keep the chest tall, then drive through the feet to stand.',
        muscleGroup: 'Legs',
        equipment: 'Bodyweight',
        imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'fb-plank',
        name: 'Forearm Plank',
        description: 'Hold a straight line from shoulders to ankles while bracing the core.',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'fb-pull-up',
        name: 'Pull-up',
        description: 'Hang from a bar with an overhand grip, pull yourself up until your chin clears the bar.',
        muscleGroup: 'Back',
        equipment: 'Pull-up bar',
        imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'fb-dumbbell-curl',
        name: 'Dumbbell Bicep Curl',
        description: 'Stand with dumbbells at your sides, curl the weights toward your shoulders while keeping your elbows pinned.',
        muscleGroup: 'Arms',
        equipment: 'Dumbbell',
        imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80'
      },
    ];

    const q = query.trim().toLowerCase();
    if (!q) return fallbacks;

    return fallbacks.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.muscleGroup.toLowerCase().includes(q) ||
      item.equipment.toLowerCase().includes(q)
    );
  }
}
