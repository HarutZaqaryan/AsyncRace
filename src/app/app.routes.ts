import { Routes } from '@angular/router';
import { GarageComponent } from './Components/Pages/garage/garage.component';
import { NotFoundPageComponent } from './Components/not-found-page/not-found-page.component';

export const routes: Routes = [
  {
    path: '',
    component: GarageComponent,
  },
  {
    path: 'garage',
    loadComponent: () =>
      import('./Components/Pages/garage/garage.component').then(
        (mod) => mod.GarageComponent
      ),
  },
  {
    path: 'winners',
    loadComponent: () =>
      import('./Components/Pages/winners/winners.component').then(
        (mod) => mod.WinnersComponent
      ),
  },
  {
    path: '404',
    component: NotFoundPageComponent,
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
