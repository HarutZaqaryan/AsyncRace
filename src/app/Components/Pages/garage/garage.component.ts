import {
  AfterContentInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CarsServivce } from '../../../Services/cars.service';
import { ICars } from '../../../Models/ICars';
import { HttpResponse } from '@angular/common/http';
import { PaginationComponent } from '../../../Shared/pagination/pagination.component';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EngineService } from '../../../Services/engine.service';
import { catchError, combineLatest, of } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WinnersPopupComponent } from '../../winners-popup/winners-popup.component';

@Component({
  selector: 'app-garage',
  standalone: true,
  animations: [],
  imports: [
    PaginationComponent,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.scss',
})
export class GarageComponent implements OnInit, AfterContentInit {
  cars: ICars[] = [];
  carElements: ElementRef[] = [];
  carsPerPage: number = 5;
  currentPage: number = 1;
  carsTotalCount: number = 0;
  selected: boolean = false;
  updatingCarsId: number = 0;
  animationAction: string = 'stop';
  disableRaceButton: boolean = false;
  disableResetButton: boolean = true;
  @ViewChildren('animatingCars') animatingCars!: QueryList<ElementRef>;
  workingCars: ICars[] = [];

  creatingCarsName: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  creatingCarsColor: FormControl = new FormControl('#000000');
  updatingCarsName: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  updatingCarsColor: FormControl = new FormControl('#000000');

  constructor(
    private carsService: CarsServivce,
    private engineService: EngineService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getCars(this.carsPerPage, this.currentPage);
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.animatingCars.forEach((carElem: ElementRef) => {
        this.carElements.push(carElem);
      });
    }, 0);
  }

  getCars(limit: number, page: number): void {
    this.carsService
      .getCars(limit, page)
      .subscribe((res: HttpResponse<ICars[]>) => {
        this.cars = res.body ?? [];
        this.carsTotalCount = +res.headers.get('X-Total-Count')!;
      });
  }

  generateCarsAutomaticly(): void {
    this.carsService.generateCars().subscribe((res) => {
      this.getCars(this.carsPerPage, this.currentPage);
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
        // ToDo // Input Errors
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
        // ToDo // Input Errors
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

  start_stopEngine(id: number, status: string) {
    this.disableRaceButton = true;
    this.engineService.start_stopEngine(id, status).subscribe((res) => {
      let car = this.cars.find((car) => car.id === id);
      car!.velocity = res.velocity;
      car!.distance = res.distance;
      console.log('from start-stop', status, car!.name, '-', car!.velocity);
    });
  }

  overallRaceAdminister(action: string) {
    this.workingCars = [];
    if (action === 'start') {
      const requests = this.cars.map((car) => {
        this.start_stopEngine(car.id, 'started');
        return this.engineService.engineMode(car.id, 'drive').pipe(
          catchError((err) => {
            this.start_stopEngine(car.id, 'stopped');
            return of(err);
          })
        );
      });
      combineLatest(requests).subscribe((res) => {
        res.forEach((result) => {
          if (result.statusText === 'OK') {
            let splitedUrl = result.url.split('=');
            let workingCar = this.cars.find(
              (car) => car.id == +splitedUrl[1].split('&')[0]
            );
            this.workingCars.push(workingCar!);
          }
        });
        let screenWidth = window.screen.width;
        let trackDistance = (60.55 / 100) * screenWidth;
        this.raceAnimation(
          'start',
          Math.floor(trackDistance),
          this.workingCars
        );
      });
    } else {
      this.cars.map((car) => {
        this.start_stopEngine(car.id, 'stopped');
      });
      this.raceAnimation('stop');
    }
  }

  individualCarAnimation(
    carElement: HTMLDivElement,
    car: ICars,
    status: string
  ) {
    let screenWidth = window.screen.width;
    let trackDistance = (60.55 / 100) * screenWidth;
    if (status === 'started') {
      this.start_stopEngine(car.id, 'started');
      this.engineService.engineMode(car.id, 'drive').subscribe(
        (res) => {
          carElement.style.transition = `${car.velocity}0ms ease-in`;
          carElement.style.transform = `translateX(${trackDistance}px)`;
        },
        (err) => {
          this.start_stopEngine(car.id, 'stopped');
        }
      );
    } else {
      this.start_stopEngine(car.id, 'stopped');
      carElement.style.transition = '1ms ease-in';
      carElement.style.transform = 'translateX(0px)';
    }
  }

  raceAnimation(action: string, trackDistance?: number, workingCars?: ICars[]) {
    this.carElements = [];
    this.animatingCars.forEach((carElem: ElementRef) => {
      this.carElements.push(carElem);
    });
    if (!workingCars?.length) {
      this.disableResetButton = true;
    }
    // ToDo // Race Loading
    if (this.carElements) {
      if (action === 'start') {
        let workingCarIds: number[] = [];

        workingCars!.map((workingCar) => {
          workingCarIds.push(workingCar.id);
        });
        let workingCarHTMLelements: ElementRef[] = [];

        this.carElements.forEach((carElem: ElementRef, index) => {
          if (workingCarIds!.includes(+carElem.nativeElement.id)) {
            workingCarHTMLelements.push(carElem);
          }
        });
        workingCarHTMLelements.forEach((carElem: ElementRef, index) => {
          carElem.nativeElement.style.transition = `${
            workingCars![index].velocity
          }0ms ease-in`;
          carElem.nativeElement.style.transform = `translateX(${trackDistance}px)`;
        });
        console.log('finish', this.workingCars);
        this.disableResetButton = false;

        if (workingCars?.length) {
          this.getWinners(workingCars);
        }
      } else {
        this.disableRaceButton = false;
        this.disableResetButton = true;

        this.carElements.forEach((carElem: ElementRef) => {
          carElem.nativeElement.style.transition = '1ms ease-in';
          carElem.nativeElement.style.transform = 'translateX(0px)';
        });
      }
    }
  }

  getWinners(cars: ICars[]) {
    let carVelocities: number[] = [];
    let winners: ICars[] = [];
    cars.map((car) => {
      carVelocities.push(car.velocity!);
    });
    let fastestCarVelocity = Math.min(...carVelocities);
    let fastestCars = cars.filter((car) => car.velocity === fastestCarVelocity);
    fastestCars.forEach((car) => {
      winners.push(car);
    });
    setTimeout(() => {
      this.dialog.open(WinnersPopupComponent, {
        data: winners,
      });
    }, winners[0].velocity! * 2 * 10);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('current page', this.currentPage);
    this.getCars(this.carsPerPage, this.currentPage);
  }
}
