import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService, SearchResponseDto } from '../../../core/services/search.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchComponent implements OnInit {
  query: string = '';
  results: SearchResponseDto = { users: [], workoutPlans: [], posts: [] };
  isLoading: boolean = false;
  activeTab: 'all' | 'users' | 'jobs' | 'posts' = 'all';

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        this.performSearch();
      }
    });
  }

  performSearch() {
    this.isLoading = true;
    this.searchService.globalSearch(this.query).subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search error', err);
        this.isLoading = false;
      }
    });
  }

  setTab(tab: 'all' | 'users' | 'jobs' | 'posts') {
    this.activeTab = tab;
  }
}
