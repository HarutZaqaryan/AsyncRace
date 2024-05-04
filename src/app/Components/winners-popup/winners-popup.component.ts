import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ICars } from '../../Models/ICars';

@Component({
  selector: 'app-winners-popup',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './winners-popup.component.html',
  styleUrl: './winners-popup.component.scss',
})
export class WinnersPopupComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data:ICars[]) {}

  ngOnInit(): void {
    console.log('data',this.data);
  }

}
