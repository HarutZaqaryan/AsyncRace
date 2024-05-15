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

const CARS_PER_PAGE: number = 7;
const NAME_MIN_LENGTH: number = 2;

const FAULTY_ENGINE_STATUS = 500;

const DEFAULT_TRACK_DISTANCE: number = 775;
// const DEFAULT_TRACK_DISTANCE = (60.55 / 100) * screenWidth;
const SCREEN_SIZE_BIGGEST: number = 1010;
const TRACK_DISTANCE_BIGGEST: number = 675;
const SCREEN_SIZE_BIG: number = 900;
const TRACK_DISTANCE_BIG: number = 570;
const SCREEN_SIZE_MEDIUM: number = 780;
const TRACK_DISTANCE_MEDIUM: number = 515;
const SCREEN_SIZE_SMALL: number = 500;
const TRACK_DISTANCE_SMALL: number = 485;

const MULTIPLE_TIMES: number = 2;
const MULTIPLE_ZEROES: number = 10;

const MIN_LENGTH_ERROR: string = 'This field must contain minimum 2 letters';

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
  styleUrls: ['./garage.component.scss','./garage.component2.scss'],
})
export class GarageComponent
  implements OnInit, AfterViewInit, AfterContentInit
{
  public cars: ICars[] = [];
  public carElements: ElementRef[] = [];
  public carsPerPage: number = CARS_PER_PAGE;
  public currentPage: number = 1;
  public totalCount: number = 0;
  public selected: boolean = false;
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
  disableIndividualRaceButton: boolean = false;
  disableIndividualResetButton: boolean = true;

  dataError: string = '';

  @ViewChildren('animatingCars') animatingCars!: QueryList<ElementRef>;
  workingCars: ICars[] = [];

  @ViewChild('createInput') createInput!: ElementRef;
  creatingCarsNameError: string = '';
  creatingCarsName: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(NAME_MIN_LENGTH),
  ]);
  @ViewChild('updateInput') updateInput!: ElementRef;
  updatingCarsNameError: string = '';
  updatingCarsName: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(NAME_MIN_LENGTH),
  ]);
  creatingCarsColor: FormControl = new FormControl('#000000');
  updatingCarsColor: FormControl = new FormControl('#000000');
  UPDATE_SNACKBARS_MESSAGE: string = '';

  constructor(
    private carsService: CarsServivce,
    private engineService: EngineService,
    private winnersService: WinnersService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.getCars(this.carsPerPage, this.currentPage);
  }

  ngAfterViewInit() {
    this.renderer.listen(
      this.createInput.nativeElement,
      'blur',
      this.onCreateInputBlur.bind(this),
    );
    this.renderer.listen(
      this.updateInput.nativeElement,
      'blur',
      this.onUpdateInputBlur.bind(this),
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
      },
    );
  }

  generateCarsAutomaticly(): void {
    this.generateLoading = true;
    this.carsService.generateCars().subscribe(
      () => {
        this.getCars(this.carsPerPage, this.currentPage);
        this.generateLoading = false;
      },
      (err) => {
        this.openSnackBar(err.message);
        this.generateLoading = false;
      },
    );
  }

  existingCar(form: FormControl) {
    const existingCar = this.cars.find(
      (car) => car.name.toLocaleLowerCase() === form.value.toLocaleLowerCase(),
    );
    return existingCar;
  }

  createCar() {
    if (this.creatingCarsName.value !== '' && this.creatingCarsName.untouched) {
      if (this.creatingCarsName.status === 'VALID') {
        if (
          !this.existingCar(this.creatingCarsName) ||
          this.creatingCarsName.value.toLocaleLowerCase() !==
            this.existingCar(this.creatingCarsName)!.name.toLocaleLowerCase()
        ) {
          this.carsService
            .createCar(
              this.creatingCarsName.value,
              this.creatingCarsColor.value,
            )
            .subscribe(
              () => {
                this.openSnackBar(
                  `"${this.titleCase(
                    this.creatingCarsName.value,
                  )}" has joined the race!`,
                );
                this.getCars(this.carsPerPage, this.currentPage);
                this.resetInput('create');
              },
              (err) => this.openSnackBar(err.message),
            );
        } else {
          this.creatingCarsNameError = `Car with name "${this.existingCar(this.creatingCarsName)!.name}" already exists`;
        }
      } else {
        if (this.creatingCarsName.hasError('minlength')) {
          this.creatingCarsNameError = MIN_LENGTH_ERROR;
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
    const selectedCar = this.cars.find((car) => car.id === id);
    this.selectedCarName = selectedCar!.name;
    this.updatingCarsId = selectedCar!.id;
    this.updatingCarsName.setValue(selectedCar!.name);
    this.updatingCarsColor.setValue(selectedCar!.color);
  }

  // * (Updated Car New Name) This line is collected externally because it is very long
  getUpdatingCarName(name: string) {
    return `"${this.titleCase(
      this.selectedCarName,
    )}" changed its name, now it performs under the name - "${this.titleCase(name)}"`;
  }

  updateCar() {
    if (this.updatingCarsName.value !== '' && this.updatingCarsName.untouched) {
      if (this.updatingCarsName.status === 'VALID') {
        if (
          !this.existingCar(this.updatingCarsName) ||
          this.updatingCarsName.value.toLocaleLowerCase() !==
            this.existingCar(this.updatingCarsName)!.name.toLocaleLowerCase()
        ) {
          this.carsService
            .updateCar(
              this.updatingCarsId,
              this.updatingCarsName.value,
              this.updatingCarsColor.value,
            )
            .subscribe(
              () => {
                this.openSnackBar(
                  this.getUpdatingCarName(this.updatingCarsName.value),
                );
                this.getCars(this.carsPerPage, this.currentPage);
                this.resetInput('update');
              },
              (err) => this.openSnackBar(err.message),
            );
        } else {
          this.updatingCarsNameError = `Car with name "${this.existingCar(this.updatingCarsName)!.name}" already exists`;
        }
      } else {
        if (this.updatingCarsName.hasError('minlength')) {
          this.updatingCarsNameError = MIN_LENGTH_ERROR;
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
      const winner = res.find((winner) => winner.id === car.id);
      if (winner) {
        this.winnersService.deleteWinner(winner.id).subscribe(
          (response) => console.log('response', response),
          (err) => {
            this.openSnackBar(err.message);
          },
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

    this.carsService.removeCar(car.id).subscribe(() => {
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
    const car = this.cars.find((car) => car.id === id);
    this.engineService.start_stopEngine(id, status).subscribe(
      (res) => {
        car!.velocity = res.velocity;
        car!.distance = res.distance;
        console.log('from start-stop', status, car!.name, '-', car!.velocity);
      },
      (err) => {
        this.openSnackBar(err.message);
      },
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
          }),
        );
      });
      combineLatest(requests).subscribe((res) => {
        res.forEach((result) => {
          if (result.statusText === 'OK') {
            const splitedUrl = result.url.split('=');
            const workingCar = this.cars.find(
              (car) => car.id == +splitedUrl[1].split('&')[0],
            );
            workingCar!.success = true;
            this.workingCars.push(workingCar!);
          } else {
            if (result.status !== FAULTY_ENGINE_STATUS) {
              this.openSnackBar(
                "Someone hacked all the cars. We're trying to fix it.",
              );
            }
          }
        });
        const screenWidth = window.screen.width;
        // let trackDistance = (60.55 / 100) * screenWidth;
        let trackDistance = DEFAULT_TRACK_DISTANCE;
        if (screenWidth <= SCREEN_SIZE_BIGGEST) {
          trackDistance = TRACK_DISTANCE_BIGGEST;
        }
        if (screenWidth <= SCREEN_SIZE_BIG) {
          trackDistance = TRACK_DISTANCE_BIG;
        }
        if (screenWidth <= SCREEN_SIZE_MEDIUM) {
          trackDistance = TRACK_DISTANCE_MEDIUM;
        }
        if (screenWidth <= SCREEN_SIZE_SMALL) {
          trackDistance = TRACK_DISTANCE_SMALL;
        }
        this.raceLoading = false;
        this.raceAnimation(
          'start',
          // screenWidth <= 970 ? Math.floor(trackDistance) : 775,
          trackDistance,
          this.workingCars,
        );
      });
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
    status: string,
  ) {
    this.individualAnimationStart = true;
    const screenWidth = window.screen.width;
    let trackDistance = DEFAULT_TRACK_DISTANCE;

    if (screenWidth <= SCREEN_SIZE_BIGGEST) {
      trackDistance = TRACK_DISTANCE_BIGGEST;
    }
    if (screenWidth <= SCREEN_SIZE_BIG) {
      trackDistance = TRACK_DISTANCE_BIG;
    }
    if (screenWidth <= SCREEN_SIZE_MEDIUM) {
      trackDistance = TRACK_DISTANCE_MEDIUM;
    }
    if (screenWidth <= SCREEN_SIZE_SMALL) {
      trackDistance = TRACK_DISTANCE_SMALL;
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
        () => {
          this.openSnackBar('Something wrong with cars engine');
          car.success = false;
          this.disableIndividualResetButton = false;
          this.disableResetButton = false;
          this.individualAnimationStart = false;
          this.animationStart = true;
          this.start_stopEngine(car.id, 'stopped');
        },
      );
    } else {
      car.started = false;
      this.animationStart = false;
      this.disableIndividualRaceButton = false;
      this.disableIndividualResetButton = false;
      this.individualAnimationStart = false;
      console.log('disable race button', this.disableIndividualRaceButton);
      console.log('cars', this.cars);
      const allStopped = this.cars.every((car) => !car.started);
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
        const workingCarIds: number[] = [];
        workingCars!.map((workingCar) => {
          workingCarIds.push(workingCar.id);
        });
        const workingCarHTMLelements: ElementRef[] = [];
        this.carElements.forEach((carElem: ElementRef) => {
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
        this.disableResetButton = false;

        if (workingCars?.length) this.getWinners(workingCars);
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
    const carVelocities: number[] = [];
    const winners: ICars[] = [];
    cars.map((car) => {
      carVelocities.push(car.velocity!);
    });
    const fastestCarVelocity = Math.min(...carVelocities);
    const fastestCars = cars.filter(
      (car) => car.velocity === fastestCarVelocity,
    );
    fastestCars.forEach((car) => {
      winners.push(car);
    });
    winners.map((winner) => {
      this.winnersService.getWinner(winner.id).subscribe(
        (res) => {
          this.winnersService
            .updateWinners(res.id, res.wins + 1, winner.velocity!)
            .subscribe(() => {});
        },
        () => {
          this.winnersService
            .createWinner({ id: winner.id, wins: 1, time: winner.velocity! })
            .subscribe((res) => {
              console.log(res);
            });
        },
      );
    });

    setTimeout(
      () => {
        this.dialog.open(WinnersPopupComponent, {
          data: winners,
        });
      },
      winners[0].velocity! * MULTIPLE_TIMES * MULTIPLE_ZEROES,
    );
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
