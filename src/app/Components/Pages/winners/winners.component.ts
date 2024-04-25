import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  bestTime: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', bestTime: 10 },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', bestTime: 10 },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', bestTime: 10 },
  {
    position: 4,
    name: 'Beryllium',
    weight: 9.0122,
    symbol: 'Be',
    bestTime: 10,
  },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B', bestTime: 10 },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', bestTime: 10 },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', bestTime: 10 },
];

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './winners.component.html',
  styleUrl: './winners.component.scss',
})
export class WinnersComponent {
  displayedColumns: string[] = [
    'position',
    'name',
    'weight',
    'symbol',
    'bestTime',
  ];
  dataSource = ELEMENT_DATA;
  
}
