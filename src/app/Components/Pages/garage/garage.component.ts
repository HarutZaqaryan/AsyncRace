import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
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
import { WinnersService } from '../../../Services/winners.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../Shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-garage',
  standalone: true,
  animations: [],
  imports: [
    CommonModule,
    PaginationComponent,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.scss',
})
export class GarageComponent
  implements OnInit, AfterViewInit, AfterContentInit
{
  cars: ICars[] = [];
  carElements: ElementRef[] = [];
  carsPerPage: number = 7;
  currentPage: number = 1;
  totalCount: number = 0;
  selected: boolean = false;
  selectedCarName: string = '';
  updatingCarsId: number = 0;

  dataLoading: boolean = true;
  raceLoading: boolean = false;
  generateLoading: boolean = false;

  animationAction: string = 'stop';
  animationStart: boolean = false;
  individualAnimationStart: boolean = false;

  disableRaceButton: boolean = false;
  disableResetButton: boolean = true;
  disableIndividualRaceButton = false;
  disableIndividualResetButton = true;

  dataError: string = '';

  @ViewChildren('animatingCars') animatingCars!: QueryList<ElementRef>;
  workingCars: ICars[] = [];

  @ViewChild('createInput') createInput!: ElementRef;
  creatingCarsNameError: string = '';
  creatingCarsName: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  @ViewChild('updateInput') updateInput!: ElementRef;
  updatingCarsNameError: string = '';
  updatingCarsName: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  creatingCarsColor: FormControl = new FormControl('#000000');
  updatingCarsColor: FormControl = new FormControl('#000000');

  constructor(
    private carsService: CarsServivce,
    private engineService: EngineService,
    private winnersService: WinnersService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.getCars(this.carsPerPage, this.currentPage);
  }

  ngAfterViewInit() {
    this.renderer.listen(
      this.createInput.nativeElement,
      'blur',
      this.onCreateInputBlur.bind(this)
    );
    this.renderer.listen(
      this.updateInput.nativeElement,
      'blur',
      this.onUpdateInputBlur.bind(this)
    );
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.animatingCars.forEach((carElem: ElementRef) => {
        this.carElements.push(carElem);
      });
    }, 0);
  }

  getCars(limit: number, page: number): void {
    this.carsService.getCars(limit, page).subscribe(
      (res: HttpResponse<ICars[]>) => {
        this.dataLoading = false;
        this.cars = res.body ?? [];
        this.totalCount = +res.headers.get('X-Total-Count')!;
        console.log('res', res);
      },
      (err) => {
        this.dataLoading = false;
        this.dataError = err.message;
        console.log('erererer', err);
      }
    );
  }

  generateCarsAutomaticly(): void {
    this.generateLoading = true;
    this.carsService.generateCars().subscribe(
      (res) => {
        this.getCars(this.carsPerPage, this.currentPage);
        this.generateLoading = false;
      },
      (err) => {
        this.openSnackBar(err.message);
        this.generateLoading = false;
      }
    );
  }

  createCar() {
    if (this.creatingCarsName.value !== '' && this.creatingCarsName.untouched) {
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
            .createCar(
              this.creatingCarsName.value,
              this.creatingCarsColor.value
            )
            .subscribe(
              (res) => {
                this.openSnackBar(
                  `"${this.titleCase(
                    this.creatingCarsName.value
                  )}" has joined the race!`
                );
                this.getCars(this.carsPerPage, this.currentPage);
                this.creatingCarsName.setValue('');
                this.creatingCarsName.reset();
                this.creatingCarsColor.setValue('#000000');
              },
              (err) => {
                this.openSnackBar(err.message);
              }
            );
        } else {
          this.creatingCarsNameError = `Car with name "${existingCar.name}" already exists`;
        }
      } else {
        if (this.creatingCarsName.hasError('minlength')) {
          this.creatingCarsNameError =
            'This field must contain minimum 2 letters';
        }
      }
    } else {
      this.creatingCarsNameError = 'This field is required';
      if (this.creatingCarsName.hasError('required')) {
        this.creatingCarsNameError = 'This field is required';
      }
    }
  }

  selectCar(id: number) {
    this.selected = true;
    let selectedCar = this.cars.find((car) => car.id === id);
    this.selectedCarName = selectedCar!.name;
    this.updatingCarsId = selectedCar!.id;
    this.updatingCarsName.setValue(selectedCar!.name);
    this.updatingCarsColor.setValue(selectedCar!.color);
  }

  updateCar() {
    if (this.updatingCarsName.value !== '' && this.updatingCarsName.untouched) {
      let existingCar = this.cars.find(
        (car) =>
          car.name.toLocaleLowerCase() ===
          this.updatingCarsName.value.toLocaleLowerCase()
      );
      if (this.updatingCarsName.status === 'VALID') {
        if (
          !existingCar ||
          this.updatingCarsName.value.toLocaleLowerCase() !==
            existingCar.name.toLocaleLowerCase()
        ) {
          this.carsService
            .updateCar(
              this.updatingCarsId,
              this.updatingCarsName.value,
              this.updatingCarsColor.value
            )
            .subscribe(
              (res) => {
                this.openSnackBar(
                  `"${this.titleCase(
                    this.selectedCarName
                  )}" changed its name, now it performs under the name - "${this.titleCase(
                    this.updatingCarsName.value
                  )}"`
                );
                this.getCars(this.carsPerPage, this.currentPage);
                this.updatingCarsName.setValue('');
                this.updatingCarsName.reset();
                this.updatingCarsColor.setValue('#000000');
              },
              (err) => {
                this.openSnackBar(err.message);
              }
            );
        } else {
          this.updatingCarsNameError = `Car with name "${existingCar.name}" already exists`;
        }
      } else {
        if (this.updatingCarsName.hasError('minlength')) {
          this.updatingCarsNameError =
            'This field must contain minimum 2 letters';
        }
      }
    } else {
      this.updatingCarsNameError = 'This field is required';
      if (this.updatingCarsName.hasError('required')) {
        this.updatingCarsNameError = 'This field is required';
      }
    }
  }

  resetInput(formName: string) {
    if (formName === 'create') {
      this.creatingCarsName.reset();
      this.creatingCarsName.setValue('');
      this.creatingCarsName.markAsUntouched();
      this.creatingCarsNameError = '';
    }
    if (formName === 'update') {
      this.updatingCarsName.reset();
      this.updatingCarsName.setValue('');
      this.updatingCarsName.markAsUntouched();
      this.updatingCarsNameError = '';
    }
  }

  onCreateInputBlur() {
    this.creatingCarsName!.markAsUntouched();
    this.creatingCarsNameError = '';
  }

  onUpdateInputBlur() {
    this.updatingCarsName!.markAsUntouched();
    this.updatingCarsNameError = '';
  }

  removeCar(car: ICars) {
    this.winnersService.getAllWinners().subscribe((res) => {
      let winner = res.find((winner) => winner.id === car.id);
      if (winner) {
        this.winnersService.deleteWinner(winner.id).subscribe(
          (response) => console.log('response', response),
          (err) => {
            this.openSnackBar(err.message);
          }
        );
      }
    });

    // ! { Remove Car From Winners - 2 way
    // * I'll leave this code example here to show that
    // * I can use another way to remove a car from the winners,
    // * but then I may get a server error if the car is not in the winners list...
    // this.winnersService.getWinner(id).subscribe((res) => {
    //   this.winnersService.deleteWinner(id).subscribe((response) => {
    //     console.log('car was deleted from winners list');
    //   },(err) => {
    //     console.log('this car not found in winners list');
    //   });
    // });
    // ! }

    this.carsService.removeCar(car.id).subscribe((res) => {
      this.getCars(this.carsPerPage, this.currentPage);
      this.updatingCarsName.setValue('');
      this.updatingCarsColor.setValue('#000000');
      this.openSnackBar(`"${this.titleCase(car.name)}" left the race !`);

      if (this.cars.length === 1 && this.currentPage > 1) {
        this.currentPage -= 1;
        this.getCars(this.carsPerPage, this.currentPage);
      }
    });
  }

  start_stopEngine(id: number, status: string) {
    this.disableRaceButton = true;
    let car = this.cars.find((car) => car.id === id);
    this.engineService.start_stopEngine(id, status).subscribe(
      (res) => {
        car!.velocity = res.velocity;
        car!.distance = res.distance;
        console.log('from start-stop', status, car!.name, '-', car!.velocity);
      },
      (err) => {
        this.openSnackBar(err.message);
      }
    );
  }

  overallRaceAdminister(action: string) {
    this.workingCars = [];
    if (action === 'start') {
      this.disableIndividualRaceButton = true;
      this.raceLoading = true;
      const requests = this.cars.map((car) => {
        this.start_stopEngine(car.id, 'started');
        return this.engineService.engineMode(car.id, 'drive').pipe(
          catchError((err) => {
            this.start_stopEngine(car.id, 'stopped');
            car.success = false;
            return of(err);
          })
        );
      });
      combineLatest(requests).subscribe(
        (res) => {
          res.forEach((result) => {
            if (result.statusText === 'OK') {
              let splitedUrl = result.url.split('=');
              let workingCar = this.cars.find(
                (car) => car.id == +splitedUrl[1].split('&')[0]
              );
              workingCar!.success = true;
              this.workingCars.push(workingCar!);
            } else {
              if (result.status !== 500) {
                // this.openSnackBar(result.message);
                this.openSnackBar("Someone hacked all the cars. We're trying to fix it.");
              }
            }
          });
          let screenWidth = window.screen.width;
          // let trackDistance = (60.55 / 100) * screenWidth;
          let trackDistance = 775;
          if (screenWidth <= 1010) {
            trackDistance = 675;
          }
          if (screenWidth <= 900) {
            trackDistance = 570;
          }
          if (screenWidth <= 780) {
            trackDistance = 515;
          }
          if (screenWidth <= 500) {
            trackDistance = 485;
          }
          this.raceLoading = false;
          this.raceAnimation(
            'start',
            // screenWidth <= 970 ? Math.floor(trackDistance) : 775,
            trackDistance,
            this.workingCars
          );
        },
        (err) => {
          console.log('erererer', err);
        }
      );
    } else {
      this.cars.map((car) => {
        this.start_stopEngine(car.id, 'stopped');
        car.started = false;
      });
      this.raceAnimation('stop');
      this.animationStart = false;
      this.disableIndividualRaceButton = false;
      this.disableIndividualResetButton = true;
    }
  }

  individualCarAnimation(
    carElement: HTMLDivElement,
    car: ICars,
    status: string
  ) {
    this.individualAnimationStart = true;
    let screenWidth = window.screen.width;
    let trackDistance = (60.55 / 100) * screenWidth;
    if (screenWidth <= 1010) {
      trackDistance = 675;
    }
    if (screenWidth <= 900) {
      trackDistance = 570;
    }
    if (screenWidth <= 780) {
      trackDistance = 515;
    }
    if (screenWidth <= 500) {
      trackDistance = 485;
    }
    if (status === 'started') {
      this.start_stopEngine(car.id, 'started');
      car.started = true;
      this.engineService.engineMode(car.id, 'drive').subscribe(
        (res) => {
          car.success = res.body?.success;
          this.individualAnimationStart = false;
          this.animationStart = true;
          this.disableResetButton = false;
          this.disableIndividualResetButton = false;
          carElement.style.transition = `${car.velocity}0ms ease-in`;
          carElement.style.transform = `translateX(${trackDistance}px)`;
        },
        (err) => {
          this.openSnackBar(err.message);
          car.success = false;
          this.disableIndividualResetButton = false;
          this.disableResetButton = false;
          this.individualAnimationStart = false;
          this.animationStart = true;
          this.start_stopEngine(car.id, 'stopped');
        }
      );
    } else {
      car.started = false;
      this.animationStart = false;
      this.disableIndividualRaceButton = false;
      this.disableIndividualResetButton = false;
      this.individualAnimationStart = false;
      console.log('disable race button', this.disableIndividualRaceButton);
      console.log('cars', this.cars);
      let allStopped = this.cars.every((car) => !car.started);
      if (allStopped) {
        setTimeout(() => {
          this.disableRaceButton = false;
        }, 0);
        this.disableResetButton = true;
      }
      this.start_stopEngine(car.id, 'stopped');
      carElement.style.transition = '1ms ease-in';
      carElement.style.transform = 'translateX(0px)';
    }
  }

  raceAnimation(action: string, trackDistance?: number, workingCars?: ICars[]) {
    this.animationStart = true;
    this.carElements = [];
    this.animatingCars.forEach((carElem: ElementRef) => {
      this.carElements.push(carElem);
    });
    if (!workingCars?.length) {
      this.disableResetButton = true;
    }
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
    console.log('winners from getwinners', winners);

    winners.map((winner) => {
      this.winnersService.getWinner(winner.id).subscribe(
        (res) => {
          this.winnersService
            .updateWinners(res.id, res.wins + 1, winner.velocity!)
            .subscribe((res) => {
              console.log('res from update car ', res);
            });
          console.log('rrresss', res);
        },
        (err) => {
          console.log('here is an error');
          console.log('winner body from animation', {
            id: winner.id,
            wins: 1,
            time: winner.velocity!,
          });

          this.winnersService
            .createWinner({ id: winner.id, wins: 1, time: winner.velocity! })
            .subscribe((res) => {
              console.log(res);
            });
        }
      );
    });

    setTimeout(() => {
      this.dialog.open(WinnersPopupComponent, {
        data: winners,
      });
    }, winners[0].velocity! * 2 * 10);
  }

  titleCase(str: string) {
    return str.toLowerCase().replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, undefined, {
      duration: 3000,
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('current page', this.currentPage);
    this.getCars(this.carsPerPage, this.currentPage);
  }
}
