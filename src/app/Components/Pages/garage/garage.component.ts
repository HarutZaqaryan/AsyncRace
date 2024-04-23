import { Component, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CarsServivce } from '../../../Services/cars-service';
import { ICars } from '../../../Models/ICars';
import { HttpResponse } from '@angular/common/http';

export const overallRaceAnimation = function () {
  return trigger('race', [
    state(
      'stop',
      style({
        transform: 'translateX(0)',
      })
    ),

    state(
      'start',
      style({
        transform: 'translateX(775px)',
      })
    ),
    state(
      'reset',
      style({
        transform: 'translateX(0)',
      })
    ),
    transition('reset => start', [animate('{{speed}}s ease-in')], {
      params: { speed: 1 },
    }),
    transition('start => reset', [animate('0.1s ease-in')]),
  ]);
};

@Component({
  selector: 'app-garage',
  standalone: true,
  animations: [overallRaceAnimation()],
  imports: [],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.scss',
})
export class GarageComponent implements OnInit {
  animationAction: string = 'stop';
  cars: ICars[] = [];
  carsPerPage: number = 3;
  currentPage: number = 1;
  carsTotalCount: number = 0;

  constructor(private carsService: CarsServivce) {}

  ngOnInit(): void {
    this.getCars(this.carsPerPage, this.currentPage);
  }

  overallRaceAdminister(action: string) {
    this.animationAction = action;
    overallRaceAnimation();
  }

  getCars(limit: number, page: number): void {
    this.carsService
      .getCars(limit, page)
      .subscribe((res: HttpResponse<ICars[]>) => {
        console.log('headers', res.headers.get('X-Total-Count'));
        console.log('cars', res.body);
        this.cars = res.body ?? [];
        this.carsTotalCount = +res.headers.get('X-Total-Count')!;
        console.log('cars - getCars()', this.cars);
      });
  }

  generateCarsAutomaticly(): void {
    this.carsService.generateCars().subscribe((res) => {
      this.getCars(this.carsPerPage, this.currentPage);
      console.log('cars - generateCars()', this.cars);
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('current page', this.currentPage);
    this.getCars(this.carsPerPage, this.currentPage);
  }
}
