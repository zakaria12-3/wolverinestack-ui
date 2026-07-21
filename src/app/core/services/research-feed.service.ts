import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ResearchStudy {
  title: string;
  journal: string;
  published: string;
  url: string;
  authors: string;
}

interface CrossrefWork {
  title?: string[];
  'container-title'?: string[];
  published?: { 'date-parts'?: number[][] };
  URL?: string;
  author?: Array<{ given?: string; family?: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class ResearchFeedService {
  private readonly endpoint = 'https://api.crossref.org/works';

  constructor(private http: HttpClient) {}

  getWorkoutStudies(): Observable<ResearchStudy[]> {
    const query = encodeURIComponent('resistance training exercise nutrition muscle hypertrophy fitness');
    const url = `${this.endpoint}?query=${query}&filter=from-pub-date:2022,type:journal-article&sort=published&order=desc&rows=6`;

    return this.http.get<any>(url).pipe(
      map(response => (response?.message?.items || []).map((item: CrossrefWork) => this.toStudy(item)))
    );
  }

  private toStudy(item: CrossrefWork): ResearchStudy {
    const authors = (item.author || [])
      .slice(0, 3)
      .map(author => [author.given, author.family].filter(Boolean).join(' '))
      .filter(Boolean)
      .join(', ');

    return {
      title: item.title?.[0] || 'Untitled study',
      journal: item['container-title']?.[0] || 'Journal article',
      published: this.formatPublished(item.published?.['date-parts']?.[0]),
      url: item.URL || 'https://www.crossref.org/',
      authors: authors || 'Research authors'
    };
  }

  private formatPublished(parts?: number[]): string {
    if (!parts?.length) return 'Recently published';
    const [year, month = 1, day = 1] = parts;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
