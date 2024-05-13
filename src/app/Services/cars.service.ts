import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICars } from '../Models/ICars';
import { Observable, forkJoin } from 'rxjs';

type TCar = Omit<ICars, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class CarsServivce {
  carsUrl: string = 'http://127.0.0.1:3000/garage';

  carNames: string[] = [
    'Toyota Camry',
    'Honda Civic',
    'Ford Mustang',
    'Chevrolet Silverado',
    'BMW 3 Series',
    'Audi A4',
    'Mercedes-Benz C-Class',
    'Nissan Altima',
    'Volkswagen Jetta',
    'Subaru Outback',
    'Tesla Model S',
    'Hyundai Sonata',
    'Kia Optima',
    'Jeep Wrangler',
    'Dodge Charger',
    'Chrysler 300',
    'GMC Sierra',
    'Cadillac Escalade',
    'Lexus RX',
    'Infiniti Q50',
    'Acura MDX',
    'Mazda CX-5',
    'Ford Explorer',
    'Chevrolet Tahoe',
    'Toyota Tacoma',
    'Honda Accord',
    'BMW 5 Series',
    'Audi Q5',
    'Mercedes-Benz E-Class',
    'Nissan Rogue',
    'Volkswagen Golf',
    'Subaru Forester',
    'Tesla Model 3',
    'Hyundai Elantra',
    'Kia Sorento',
    'Jeep Grand Cherokee',
    'Dodge Challenger',
    'GMC Yukon',
    'Cadillac XT5',
    'Lexus ES',
    'Infiniti QX60',
    'Acura RDX',
    'Mazda3',
    'Ford F-150',
    'Chevrolet Equinox',
    'Toyota Highlander',
    'Honda CR-V',
    'BMW X5',
    'Audi A6',
    'Mercedes-Benz GLE',
    'Nissan Pathfinder',
    'Volkswagen Passat',
    'Subaru Impreza',
    'Tesla Model X',
    'Hyundai Santa Fe',
    'Kia Sportage',
    'Jeep Cherokee',
    'Dodge Durango',
    'GMC Canyon',
    'Cadillac CT6',
    'Lexus IS',
    'Infiniti QX80',
    'Acura TLX',
    'Mazda CX-9',
    'Ford Edge',
    'Chevrolet Traverse',
    'Toyota 4Runner',
    'Honda Pilot',
    'BMW 7 Series',
    'Audi Q7',
    'Mercedes-Benz GLC',
    'Nissan Murano',
    'Volkswagen Tiguan',
    'Subaru Legacy',
    'Tesla Model Y',
    'Hyundai Tucson',
    'Kia Soul',
    'Jeep Compass',
    'Dodge Journey',
    'GMC Acadia',
    'Cadillac ATS',
    'Lexus NX',
    'Infiniti QX50',
    'Acura ILX',
    'Mazda MX-5 Miata',
    'Ford Ranger',
    'Chevrolet Colorado',
    'Toyota Prius',
    'Honda Odyssey',
    'BMW X3',
    'Audi Q3',
    'Mercedes-Benz GLA',
    'Nissan Sentra',
    'Volkswagen Atlas',
    'Subaru Crosstrek',
    'Hyundai Kona',
    'Kia Forte',
    'Jeep Renegade',
    'Dodge Grand Caravan',
    'GMC Terrain',
  ];
  carColors: string[] = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#FFA500',
    '#800080',
    '#008000',
    '#000080',
    '#FFC0CB',
    '#A52A2A',
    '#D2691E',
    '#B22222',
    '#8B0000',
    '#800000',
    '#FF4500',
    '#FF6347',
    '#FF7F50',
    '#DC143C',
    '#FF69B4',
    '#C71585',
    '#4B0082',
    '#9400D3',
    '#9932CC',
    '#8A2BE2',
    '#800080',
    '#9370DB',
    '#7B68EE',
    '#6A5ACD',
    '#483D8B',
    '#4169E1',
    '#0000CD',
    '#000080',
    '#00008B',
    '#00BFFF',
    '#1E90FF',
    '#ADD8E6',
    '#87CEEB',
    '#4682B4',
    '#B0C4DE',
    '#5F9EA0',
    '#AFEEEE',
    '#E0FFFF',
    '#00CED1',
    '#20B2AA',
    '#008080',
    '#008B8B',
    '#00FFFF',
    '#7FFFD4',
    '#00FA9A',
    '#ADFF2F',
    '#32CD32',
    '#228B22',
    '#008000',
    '#006400',
    '#556B2F',
    '#808000',
    '#6B8E23',
    '#9ACD32',
    '#FFFF00',
    '#FFD700',
    '#FFA500',
    '#FF8C00',
    '#FF4500',
    '#DAA520',
    '#B8860B',
    '#FF6347',
    '#FF69B4',
    '#FF1493',
    '#C71585',
    '#DB7093',
    '#A0522D',
    '#8B4513',
    '#2F4F4F',
    '#708090',
    '#696969',
    '#808080',
    '#A9A9A9',
    '#C0C0C0',
    '#D3D3D3',
    '#FFFFFF',
    '#000000',
    '#F5F5DC',
    '#F5DEB3',
    '#FFE4B5',
    '#FFDAB9',
    '#FFE4C4',
    '#FFDEAD',
    '#FAEBD7',
    '#F0E68C',
    '#BDB76B',
    '#EEE8AA',
    '#FFFACD',
    '#F0FFF0',
    '#90EE90',
    '#98FB98',
    '#8FBC8F',
    '#3CB371',
    '#2E8B57',
    '#008000',
  ];

  constructor(private http: HttpClient) {}

  createCarList(): TCar[] {
    const carsList100: TCar[] = [];
    for (let i = 0; i < this.carNames.length; i++) {
      carsList100.push({
        name: this.carNames[i],
        color: this.carColors[i],
      });
    }
    return carsList100;
  }

  getCars(limit: number, page: number) {
    return this.http.get<ICars[]>(
      `${this.carsUrl}?_limit=${limit}&&_page=${page}`,
      {
        observe: 'response',
      }
    );
  }

  getCar(id: number) {
    return this.http.get<ICars>(`${this.carsUrl}/${id}`);
  }

  generateCars() {
    const observables: Observable<TCar>[] = [];

    this.createCarList().forEach((car) => {
      observables.push(
        this.http.post<TCar>(
          this.carsUrl,
          { name: car.name, color: car.color },
          { headers: { 'Content-type': 'application/json' } }
        )
      );
    });

    return forkJoin(observables);
  }

  createCar(carName: string, carColor: string) {
    return this.http.post<TCar>(
      this.carsUrl,
      { name: carName, color: carColor },
      { headers: { 'Content-type': 'application/json' } }
    );
  }

  updateCar(id: number, carNewName: string, carNewColor: string) {
    return this.http.put<TCar>(
      `${this.carsUrl}/${id}`,
      { name: carNewName, color: carNewColor },
      { headers: { 'Content-type': 'application/json' } }
    );
  }

  removeCar(id: number) {
    return this.http.delete(`${this.carsUrl}/${id}`);
    // ! I tried adding parameters this way, but it's not working.
    // let params = new HttpParams().set('id',id)
    // return this.http.delete(this.carsUrl,{params});
  }
}
