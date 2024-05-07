import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { WinnersService } from '../../../Services/winners.service';
import { CarsServivce } from '../../../Services/cars.service';
import { IWinners } from '../../../Models/IWinners';
import { HttpResponse } from '@angular/common/http';
import { IWinnerDetails } from '../../../Models/IWinnerDetails';
import { combineLatest } from 'rxjs';
import { PaginationComponent } from '../../../Shared/pagination/pagination.component';

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [MatTableModule, PaginationComponent],
  templateUrl: './winners.component.html',
  styleUrl: './winners.component.scss',
})
export class WinnersComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'car', 'name', 'wins', 'bestTime'];
  public dataSource: IWinnerDetails[] = [];
  public carsPerPage: number = 5;
  public currentPage: number = 1;
  public totalCount: number = 0;
  private winners: IWinners[] = [];
  private winnerDetails: IWinnerDetails[] = [];
  private sorted: boolean = false;
  private sortBy: string = '';
  private sortTerm: string = '';
  private sortOrder: string = '';

  constructor(
    private winnersService: WinnersService,
    private carsService: CarsServivce
  ) {}

  ngOnInit(): void {
    this.getWinners(this.carsPerPage, this.currentPage);
  }

  getWinners(limit: number, page: number, sort?: string, order?: string): void {
    this.winnersService
      .getWinners(limit, page, sort, order)
      .subscribe((response: HttpResponse<IWinners[]>) => {
        console.log(response);
        console.log('winners body',response.body);
        
        this.winners = response.body ?? [];
        this.totalCount = +response.headers.get('X-Total-Count')!;
        // console.log('winners', this.winners);

        const requests = this.winners.map((winner) => {
          return this.carsService.getCar(winner.id);
        });

        combineLatest(requests).subscribe((res) => {
          let winnerDetail;
          this.winnerDetails = [];
          res.map((carDetail, index) => {
            winnerDetail = { ...carDetail, ...response.body![index] };
            // console.log('cardetail', carDetail);
            // console.log('winnerdetail', winnerDetail);
            this.winnerDetails.push(winnerDetail);
          });

          this.dataSource = this.winnerDetails;
          console.log('winner detailsss', this.winnerDetails);
        });
      });
  }

  sort(sortBy: string, order: string) {
    console.log('this sortBy - ', this.sortBy);
    console.log('sortBy + order - ', sortBy + order);

    if (sortBy + order === this.sortBy) {
      this.getWinners(this.carsPerPage, this.currentPage);
      this.sorted = false;
      this.sortBy = '';
    } else {
      this.getWinners(this.carsPerPage, this.currentPage, sortBy, order);
      this.sorted = true;
      this.sortBy = sortBy;
    }
    if (this.sorted) {
      this.sortBy = sortBy + order;
      this.sortTerm = sortBy;
      this.sortOrder = order;
    }
  }

  onPageChange(page: number): void {
    this.winnerDetails = [];
    this.currentPage = page;
    console.log('current page', this.currentPage);
    if (this.sorted) {
      this.getWinners(
        this.carsPerPage,
        this.currentPage,
        this.sortTerm,
        this.sortOrder
      );
    } else {
      this.getWinners(this.carsPerPage, this.currentPage);
    }
  }
}
