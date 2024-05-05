import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalCount = 0;
  @Input() carsPerPage = 3;

  @Output() onPageChange:EventEmitter<any> = new EventEmitter();

  callParentOnPageChange(page:number) {
    this.onPageChange.emit(page);
  }
}
