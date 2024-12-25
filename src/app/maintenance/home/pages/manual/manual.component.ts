import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadMatch, TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { map, noop, Observable, Observer, of, switchMap, tap } from 'rxjs';
import { Paged } from '../../../../shared/interfaces/paged.interface';
import { SupplierService } from '../../../../logistics/supplier/services/supplier.service';
import { Response } from '../../../../shared/interfaces/response.interface';
import { Page } from '../../../../shared/interfaces/page.interface';
import { Supplier } from '../../../../logistics/supplier/interfaces/supplier.interface';

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #customItemTemplate let-model="item" let-index="index">
      <h5>This is: {{model | json}} Index: {{ index }}</h5>
    </ng-template>

    <pre class="card card-block card-header">Model: {{ search | json }}</pre>
    <pre class="mb-3">Selected option: {{selectedOption | json}}</pre>

    <input [(ngModel)]="search"
            [typeahead]="suggestions$"
            [typeaheadAsync]="true"
            [typeaheadMinLength]="2"
            [typeaheadItemTemplate]="customItemTemplate"
            (typeaheadOnSelect)="onSelect($event)"
            typeaheadOptionField="reasonSocial"
            class="form-control form-control-sm text-uppercase">

    <div class="alert alert-danger" role="alert" *ngIf="errorMessage">
      {{ errorMessage }}
    </div>
  `
})
export class ManualComponent implements OnInit {
  search?: string;
  suggestions$?: Observable<Supplier[]>;
  errorMessage?: string;
  selectedOption?: Supplier;

  constructor(private service: SupplierService) { }

  ngOnInit(): void {
    let object: Paged = {
      pageSize: 20,
      pageNumber: 1,
      orderColumn: "supplier.reason_social",
      order: "ASC",
      lstFilter: [
        {
          object: "supplier",
          column: "reason_social",
          value: "",
          operator: "like"
        }
      ]
    }

    this.suggestions$ = new Observable((observer: Observer<string | undefined>) => {
      observer.next(this.search);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          object.lstFilter[0].value=query;
          return this.service.findByPagination(object).pipe(
            map((data: Response<Page>) => data && data.value.content || []),
            tap(() => noop, err => {
              this.errorMessage = err && err.message || 'Error en la consulta';
            })
          );
        }

        return of([]);
      })
    );
  }

  onSelect(event: TypeaheadMatch<Supplier>): void {
    this.selectedOption = event.item;
  }
}
