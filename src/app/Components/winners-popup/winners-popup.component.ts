import { Component, Inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ICars } from '../../Models/ICars';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-winners-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './winners-popup.component.html',
  styleUrl: './winners-popup.component.scss',
})
export class WinnersPopupComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ICars[]) {}
}
