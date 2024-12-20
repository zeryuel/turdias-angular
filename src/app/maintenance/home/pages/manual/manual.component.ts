import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { map, noop, Observable, Observer, of, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface GitHubUserSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

interface GitHubUser {
  login: string;
  id:  number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  received_events_url: string;
  type: string;
  score: number;
}

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre class="card card-block card-header">Model: {{ search | json }}</pre>

    <input [(ngModel)]="search"
            typeaheadOptionField="login"
            [typeahead]="suggestions$"
            [typeaheadAsync]="true"
            class="form-control"
            placeholder="Enter GitHub username">

    <div class="alert alert-danger" role="alert" *ngIf="errorMessage">
      {{ errorMessage }}
    </div>
  `
})
export class ManualComponent implements OnInit {
  search?: string;
  suggestions$?: Observable<GitHubUser[]>;
  errorMessage?: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.suggestions$ = new Observable((observer: Observer<string | undefined>) => {
      observer.next(this.search);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          // using github public api to get users by name
          return this.http.get<GitHubUserSearchResponse>(
            'https://api.github.com/search/users', {
            params: { q: query }
          }).pipe(
            map((data: GitHubUserSearchResponse) => data && data.items || []),
            tap(() => noop, err => {
              // in case of http error
              this.errorMessage = err && err.message || 'Something goes wrong';
            })
          );
        }

        return of([]);
      })
    );
  }
}
