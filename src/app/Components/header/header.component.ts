import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public activeRoute: string = 'garage';

  constructor(private router: Router) {}

  garageBtnClick() {
    this.router.navigate(['/', 'garage']);
    this.activeRoute = 'garage';
  }
  winnersBtnClick() {
    this.router.navigate(['/', 'winners']);
    this.activeRoute = 'winners';
  }
}
