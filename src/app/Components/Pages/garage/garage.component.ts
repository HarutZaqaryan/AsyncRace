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
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
import { IDrive } from '../../../Models/IDrive';

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
const MULTIPLE_ZEROES: number = 20;

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
  styleUrls: [
    './garage.component.scss',
    './garage.component(Responsivity).scss',
  ],
})
export class GarageComponent
  implements OnInit, AfterViewInit, AfterContentInit
{
  public cars: ICars[] = [];
  public carsPerPage: number = CARS_PER_PAGE;
  public currentPage: number = 1;
  public totalCount: number = 0;
  public selected: boolean = false;
  private carElements: ElementRef[] = [];
  private selectedCarName: string = '';
  private updatingCarsId: number = 0;

  public dataLoading: boolean = true;
  public raceLoading: boolean = false;
  public generateLoading: boolean = false;

  public animationStart: boolean = false;
  public individualAnimationStart: boolean = false;

  public disableRaceButton: boolean = false;
  public disableResetButton: boolean = true;
  public disableIndividualResetButton: boolean = true;

  public dataError: string = '';

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
  colorChanged: boolean = false;

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
    this.dataError = '';
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

  private getCars(limit: number, page: number): void {
    this.carsService.getCars(limit, page).subscribe(
      (res: HttpResponse<ICars[]>) => {
        this.dataLoading = false;
        this.cars = res.body ?? [];
        this.totalCount = +res.headers.get('X-Total-Count')!;
      },
      (err) => {
        this.dataLoading = false;
        this.disableRaceButton = true;
        this.dataError = err.name;
      },
    );
  }

  public generateCarsAutomaticly(): void {
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

  private deepTrim(str: string): string {
    return str.replace(/\s+/g, '');
  }

  // * The function checks for the presence of a car with the same name that the user is trying to add or update.
  // * And returns it if it exists.
  private existingCar(form: FormControl): ICars | undefined {
    // I noticed that the function only works with those cars that are displayed on the current page.
    // I could easily make it work for all cars by simply using another array that includes all the cars...

    const existingCar = this.cars.find(
      (car) =>
        this.deepTrim(car.name.toLocaleLowerCase().trim()) ===
        this.deepTrim(form.value.toLocaleLowerCase().trim()),
    );

    return existingCar;
  }

  public createCar(): void {
    if (this.creatingCarsName.value !== '' && this.creatingCarsName.untouched) {
      if (this.creatingCarsName.status === 'VALID') {
        if (!this.existingCar(this.creatingCarsName)) {
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

  public selectCar(id: number): void {
    const selectedCar = this.cars.find((car) => car.id === id);
    this.selected = true;
    this.selectedCarName = selectedCar!.name;
    this.updatingCarsId = selectedCar!.id;
    this.updatingCarsName.setValue(selectedCar!.name);
    this.updatingCarsColor.setValue(selectedCar!.color);
  }

  private getUpdatingMessage(): string {
    let message = '';
    if (this.existingCar(this.updatingCarsName) && this.colorChanged) {
      message = `${this.titleCase(this.existingCar(this.updatingCarsName)!.name)} changed its color to - " ${this.updatingCarsColor.value}"`;
    } else if (!this.existingCar(this.updatingCarsName) && this.colorChanged) {
      message = `${this.titleCase(this.selectedCarName)} changed its name and color. Now it performs under the name - "${this.titleCase(this.updatingCarsName.value)}"... And its color is - "${this.updatingCarsColor.value}"`;
    } else if (!this.existingCar(this.updatingCarsName) && !this.colorChanged) {
      message = `"${this.titleCase(
        this.selectedCarName,
      )}" changed its name, now it performs under the name - "${this.titleCase(this.updatingCarsName.value)}"`;
    }
    return message;
  }

  public updateCar(): void {
    if (this.updatingCarsName.value !== '' && this.updatingCarsName.untouched) {
      if (this.updatingCarsName.status === 'VALID') {
        if (!this.existingCar(this.updatingCarsName) || this.colorChanged) {
          this.carsService
            .updateCar(
              this.updatingCarsId,
              this.updatingCarsName.value,
              this.updatingCarsColor.value,
            )
            .subscribe(
              () => {
                this.openSnackBar(this.getUpdatingMessage());
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

  public resetInput(formName: string): void {
    if (formName === 'create') {
      this.creatingCarsName.reset();
      this.creatingCarsName.setValue('');
      this.creatingCarsColor.setValue('#000000');
      this.creatingCarsName.markAsUntouched();
      this.creatingCarsNameError = '';
    }
    if (formName === 'update') {
      this.selected = false;
      this.colorChanged = false;
      this.updatingCarsName.reset();
      this.updatingCarsName.setValue('');
      this.updatingCarsColor.setValue('#000000');
      this.updatingCarsName.markAsUntouched();
      this.updatingCarsNameError = '';
    }
  }

  private onCreateInputBlur(): void {
    this.creatingCarsNameError = '';
    this.creatingCarsName!.markAsUntouched();
  }

  private onUpdateInputBlur(): void {
    this.updatingCarsNameError = '';
    this.updatingCarsName!.markAsUntouched();
  }

  public removeCar(car: ICars): void {
    this.winnersService.getAllWinners().subscribe((res) => {
      const winner = res.find((winner) => winner.id === car.id);
      if (winner) {
        this.winnersService.deleteWinner(winner.id).subscribe(
          (response) => console.log('Delete Winner', response),
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

  public start_stopEngine(id: number, status: string): void {
    this.disableRaceButton = true;
    const car = this.cars.find((car) => car.id === id);
    this.engineService.start_stopEngine(id, status).subscribe(
      (res) => {
        car!.velocity = res.velocity;
        car!.distance = res.distance;
        console.log('From start-stop', status, car!.name, '-', car!.velocity);
      },
      (err) => {
        this.openSnackBar(err.message);
      },
    );
  }

  // * The function begins processing racing operations
  // * Depending on the action received.
  public overallRaceAdminister(action: string): void {
    this.workingCars = [];
    if (action === 'start') {
      this.handleRaceStart();
    } else {
      this.handleRaceStop();
    }
  }

  // * The function calculates the distance that cars must travel
  // * Depending on the width of the screen.
  private calculateTrackDistance(): number {
    const screenWidth = window.screen.width;
    if (screenWidth <= SCREEN_SIZE_SMALL) {
      return TRACK_DISTANCE_SMALL;
    } else if (screenWidth <= SCREEN_SIZE_MEDIUM) {
      return TRACK_DISTANCE_MEDIUM;
    } else if (screenWidth <= SCREEN_SIZE_BIG) {
      return TRACK_DISTANCE_BIG;
    } else if (screenWidth <= SCREEN_SIZE_BIGGEST) {
      return TRACK_DISTANCE_BIGGEST;
    } else {
      return DEFAULT_TRACK_DISTANCE;
    }
  }

  // * The function turns on the engines of all cars
  // * And returns DRIVE_MODE requests
  // * (no matter whether a successful result comes or error)
  private setDriveMode(car: ICars) {
    this.start_stopEngine(car.id, 'started');
    return this.engineService.engineMode(car.id, 'drive').pipe(
      catchError((err) => {
        this.start_stopEngine(car.id, 'stopped');
        car.success = false;
        return of(err);
      }),
    );
  }

  // * The function takes car IDs from the URL of successful 'DRIVE_MODE' requests.
  // * And returns them
  private extractCarIdFromUrl(url: string | null): number {
    return +url!.split('=')[1].split('&')[0];
  }

  // * The function takes all DIRVE_MODE requests.
  // * Walks trough them, checks if 'cars' array include workingcar
  // * And pushs all working cars to 'workingCars' array for further operations.
  // ! If no car can race, it shows a notification.
  private processRaceResults(
    res: HttpResponse<IDrive>[] | HttpErrorResponse[],
  ): void {
    res.forEach((result) => {
      if (result.statusText === 'OK') {
        const carId = this.extractCarIdFromUrl(result.url);
        const workingCar = this.cars.find((car) => car.id === carId);
        if (workingCar) {
          workingCar.success = true;
          this.workingCars.push(workingCar);
        }
      } else if (result.status !== FAULTY_ENGINE_STATUS) {
        this.openSnackBar(
          "Someone hacked all the cars. We're trying to fix it.",
        );
      }
    });
  }

  // * The function receives all 'DRIVE_MODE' requests,
  // * Combines requests and passes them to the 'processRaceresults()' function.
  // * In successful cases 'workingCars' array is filling with cars.
  // * And 'raceAnimation' function receives his required parameters
  private handleRaceStart(): void {
    this.raceLoading = true;
    this.cars.forEach((car) => {
      car.animationStarted = true;
    });
    const requests = this.cars.map((car) => this.setDriveMode(car));
    combineLatest(requests).subscribe((res) => {
      this.processRaceResults(res);
      const trackDistance = this.calculateTrackDistance();
      this.raceLoading = false;
      this.raceAnimation('start', trackDistance, this.workingCars);
    });
  }

  // * The function turns off the engines of all cars
  // * And returns them to their start position.
  private handleRaceStop(): void {
    this.cars.forEach((car) => {
      this.start_stopEngine(car.id, 'stopped');
      car.started = false;
      car.animationStarted = false;
    });
    this.raceAnimation('stop');
    this.animationStart = false;
    this.disableIndividualResetButton = true;
  }

  // * The function begins processing individual car racing operations,
  // * Depending on the action received.
  public individualCarAnimation(
    carElement: HTMLDivElement,
    car: ICars,
    status: string,
  ): void {
    this.individualAnimationStart = true;
    this.cars.forEach((car) => (car.success = true));

    const trackDistance = this.calculateTrackDistance();

    if (status === 'started') {
      this.handleIndividualRaceStart(carElement, car, trackDistance);
    } else {
      this.handleIndividualRaceStop(carElement, car);
    }
  }

  // * The function turns on the car engine, sets its velocity and distance,
  // * And depending on the response of the “DRIVE_MODE” request begins racing operations.
  private handleIndividualRaceStart(
    carElement: HTMLDivElement,
    car: ICars,
    trackDistance: number,
  ): void {
    this.start_stopEngine(car.id, 'started');
    car.animationStarted = true;

    this.engineService.engineMode(car.id, 'drive').subscribe(
      (res) => this.onDriveSuccess(res, car, carElement, trackDistance),
      () => this.onDriveError(car),
    );
  }

  // * The function manipulates action buttons(effects and disabling),
  // * And starts race animation with received parameters(velocity & trackDIstance)
  private onDriveSuccess(
    res: HttpResponse<IDrive>,
    car: ICars,
    carElement: HTMLDivElement,
    trackDistance: number,
  ): void {
    car.animationStarted = true;
    car.started = true;
    car.success = res.body?.success;
    this.individualAnimationStart = false;
    this.animationStart = true;
    this.disableResetButton = false;
    this.disableIndividualResetButton = false;

    carElement.style.transition = `${car.velocity}0ms ease-in`;
    carElement.style.transform = `translateX(${trackDistance}px)`;
  }

  // * The function manipulates action buttons(in case when 'DRIVE_MODE' request returns error),
  // * And stops car engine.
  private onDriveError(car: ICars): void {
    car.animationStarted = true;
    car.started = true;
    car.success = false;
    this.disableResetButton = false;
    this.disableIndividualResetButton = false;
    this.individualAnimationStart = false;
    this.animationStart = true;

    this.openSnackBar(`Something is wrong with the ${car.name} engine`);
    this.start_stopEngine(car.id, 'stopped');
  }

  // * The function manipulates action buttons(effects and disabling),
  // * And returns the car to its start position.
  private handleIndividualRaceStop(
    carElement: HTMLDivElement,
    car: ICars,
  ): void {
    car.started = false;
    car.animationStarted = false;
    this.animationStart = false;
    this.disableIndividualResetButton = false;
    this.individualAnimationStart = false;

    const allStopped = this.cars.every((c) => !c.started);
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

  // private raceAnimation(
  //   action: string,
  //   trackDistance?: number,
  //   workingCars?: ICars[],
  // ): void {
  //   this.animationStart = true;
  //   this.carElements = [];
  //   this.animatingCars.forEach((carElem: ElementRef) => {
  //     this.carElements.push(carElem);
  //   });
  //   if (!workingCars?.length) this.disableResetButton = true;
  //   if (this.carElements) {
  //     if (action === 'start') {
  //       const workingCarIds: number[] = [];
  //       workingCars!.map((workingCar) => {
  //         workingCarIds.push(workingCar.id);
  //       });
  //       const workingCarHTMLelements: ElementRef[] = [];
  //       this.carElements.forEach((carElem: ElementRef) => {
  //         if (workingCarIds!.includes(+carElem.nativeElement.id)) {
  //           workingCarHTMLelements.push(carElem);
  //         }
  //       });
  //       workingCarHTMLelements.forEach((carElem: ElementRef, index) => {
  //         carElem.nativeElement.style.transition = `${
  //           workingCars![index].velocity
  //         }0ms ease-in`;
  //         carElem.nativeElement.style.transform = `translateX(${trackDistance}px)`;
  //       });
  //       this.disableResetButton = false;

  //       if (workingCars?.length) this.getWinners(workingCars);
  //     } else {
  //       this.disableRaceButton = false;
  //       this.disableResetButton = true;
  //       this.carElements.forEach((carElem: ElementRef) => {
  //         carElem.nativeElement.style.transition = '1ms ease-in';
  //         carElem.nativeElement.style.transform = 'translateX(0px)';
  //       });
  //     }
  //   }
  // }

  private raceAnimation(
    action: string,
    trackDistance?: number,
    workingCars?: ICars[],
  ): void {
    this.animationStart = true;
    this.carElements = this.animatingCars.map((carElem: ElementRef) => carElem);

    if (!workingCars?.length) this.disableResetButton = true;

    if (this.carElements) {
      if (action === 'start') {
        this.startRace(trackDistance, workingCars);
      } else {
        this.resetRace();
      }
    }
  }

  private startRace(
    trackDistance: number | undefined,
    workingCars: ICars[] | undefined,
  ) {
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
  }

  private resetRace() {
    this.disableRaceButton = false;
    this.disableResetButton = true;
    this.carElements.forEach((carElem: ElementRef) => {
      carElem.nativeElement.style.transition = '1ms ease-in';
      carElem.nativeElement.style.transform = 'translateX(0px)';
    });
  }

  private getWinners(cars: ICars[]): void {
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
              console.log('winner', res);
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

  private titleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  private openSnackBar(message: string): void {
    this._snackBar.open(message, undefined, {
      duration: 3500,
    });
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this.getCars(this.carsPerPage, this.currentPage);
  }
}
