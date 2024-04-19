import { Component } from '@angular/core';
import { Router,RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private router:Router){}

  garageBtnClick() {
    this.router.navigate(['/', 'garage']);
  }
  winnersBtnClick() {
    this.router.navigate(['/', 'winners']);
  }
}
