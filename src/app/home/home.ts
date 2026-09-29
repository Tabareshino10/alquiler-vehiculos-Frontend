import { Component, inject } from '@angular/core';
import { EnviarDatosService } from '../servicios/enviar-datos-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {

  dataService = inject(EnviarDatosService);
  private router = inject(Router);

  usuario: any = null;

  ngOnInit(): void {
    const datoActual = this.dataService.usuarioSignal();
    console.log("Dato actual al iniciar:", datoActual);
    
    if (datoActual) {
      this.usuario = datoActual;
    }
  }

  cerrarSesion() {
    this.dataService.limpiar();
    this.usuario = null;
    this.router.navigate(['/login']);
  }
}
