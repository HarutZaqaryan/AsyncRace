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
import { PaginationComponent } from '../../../Shared/pagination/pagination.component';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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
    transition('reset => start', [animate('{{speed}}ms ease-in')], {
      params: { speed: 1 },
    }),
    transition('start => reset', [animate('0.1s ease-in')]),
  ]);
};

@Component({
  selector: 'app-garage',
  standalone: true,
  animations: [overallRaceAnimation()],
  imports: [PaginationComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.scss',
})
export class GarageComponent implements OnInit {
  animationAction: string = 'stop';
  cars: ICars[] = [];
  carsPerPage: number = 3;
  currentPage: number = 1;
  carsTotalCount: number = 0;
  selected: boolean = false;
  updatingCarsId: number = 0;

  creatingCarsName: FormControl = new FormControl('', [Validators.required,Validators.minLength(2)]);
  creatingCarsColor: FormControl = new FormControl('#000000');
  updatingCarsName: FormControl = new FormControl('', [Validators.required,Validators.minLength(2)]);
  updatingCarsColor: FormControl = new FormControl('#000000');

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

  createCar() {
    let existingCar = this.cars.find(
      (car) =>
        car.name.toLocaleLowerCase() ===
        this.creatingCarsName.value.toLocaleLowerCase()
    );

    if (this.creatingCarsName.status === 'VALID') {
      if (
        !existingCar ||
        this.creatingCarsName.value.toLocaleLowerCase() !==
          existingCar!.name.toLocaleLowerCase()
      ) {
        this.carsService
          .createCar(this.creatingCarsName.value, this.creatingCarsColor.value)
          .subscribe((res) => {
            this.getCars(this.carsPerPage, this.currentPage);
            this.creatingCarsName.setValue('');
            this.creatingCarsColor.setValue('#000000');
          });
      } else {
        console.log('car already exist');
      }
    }
  }

  selectCar(id: number) {
    this.selected = true;
    let selectedCar = this.cars.find((car) => car.id === id);
    this.updatingCarsId = selectedCar!.id;
    this.updatingCarsName.setValue(selectedCar!.name);
    this.updatingCarsColor.setValue(selectedCar!.color);
  }

  updateCar() {
    let updatingCar = this.cars.find(
      (car) =>
        car.name.toLocaleLowerCase() ===
        this.updatingCarsName.value.toLocaleLowerCase()
    );

    if (this.updatingCarsName.status === 'VALID') {
      if (
        !updatingCar ||
        this.updatingCarsName.value.toLocaleLowerCase() !==
          updatingCar.name.toLocaleLowerCase()
      ) {
        this.carsService
          .updateCar(
            this.updatingCarsId,
            this.updatingCarsName.value,
            this.updatingCarsColor.value
          )
          .subscribe((res) => {
            this.getCars(this.carsPerPage, this.currentPage);
            this.updatingCarsName.setValue('');
            this.updatingCarsColor.setValue('#000000');
          });
      } else {
        console.log('car with this name already exist');
      }
    }
  }

  removeCar(id: number) {
    this.carsService.removeCar(id).subscribe((res) => {
      this.getCars(this.carsPerPage, this.currentPage);
      this.updatingCarsName.setValue('');
      this.updatingCarsColor.setValue('#000000');

      if (this.cars.length === 1 && this.currentPage > 1) {
        this.currentPage -= 1;
        this.getCars(this.carsPerPage, this.currentPage);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('current page', this.currentPage);
    this.getCars(this.carsPerPage, this.currentPage);
  }
}
