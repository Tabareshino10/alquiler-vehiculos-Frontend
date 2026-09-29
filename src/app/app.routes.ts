import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { Home } from './home/home';
import { Alquiler } from './alquiler/alquiler';
import { Vehiculo } from './vehiculo/vehiculo';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {path: 'login',component: Login,},

  {path: 'registro',component: Registro,},

  {path: 'home',component: Home,},

  {path: 'vehiculo', component: Vehiculo},

  {path: 'alquiler', component: Alquiler},
  
];
