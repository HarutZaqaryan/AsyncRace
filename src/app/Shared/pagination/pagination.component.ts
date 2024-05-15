import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const CURRENT_PAGE: number = 1;
const TOTAL_COUNT: number = 0;
const CARS_PER_PAGE: number = 3;
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input() currentPage = CURRENT_PAGE;
  @Input() totalCount = TOTAL_COUNT;
  @Input() carsPerPage = CARS_PER_PAGE;

  @Output() onPageChange: EventEmitter<number> = new EventEmitter();

  callParentOnPageChange(page: number) {
    this.onPageChange.emit(page);
  }
}
