import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AlquilerService } from '../servicios/alquiler-service';
import { VehiculoService } from '../servicios/vehiculo-service';
import { AlquilerE } from '../Entidades/alquiler';
import { VehiculoE } from '../Entidades/vehiculo';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { EnviarDatosService } from '../servicios/enviar-datos-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-alquiler',
  imports: [NgFor, CommonModule, FormsModule,RouterLink, RouterLinkActive,],
  templateUrl: './alquiler.html',
  styleUrl: './alquiler.css',
})
export class Alquiler implements OnInit {

  listaA: AlquilerE[] = [];
  vehiculosDisponibles: VehiculoE[] = [];
  alquiler: AlquilerE = new AlquilerE();
  placaSeleccionada: string = "";

  
  dataService = inject(EnviarDatosService);
  private router = inject(Router);

  usuario: any = null;

  ngOnInit(): void {
    this.listarAlquileres();
    const datoActual = this.dataService.usuarioSignal();
    console.log("Dato actual al iniciar:", datoActual);
    
    if (datoActual) {
      this.usuario = datoActual;
    }
  }

  constructor(
    private servicioAlquiler: AlquilerService,
    private servicioVehiculo: VehiculoService,
    private cdr: ChangeDetectorRef
  ) { }

  private listarAlquileres() {
    this.servicioAlquiler.listarAlquileres().subscribe(dato => {
      this.listaA = dato;
      this.cdr.markForCheck();
    });
  }



  solicitarAlquiler() {
    this.servicioVehiculo.buscarPorEstado("disponible").subscribe(dato => {
      this.vehiculosDisponibles = dato;
      this.cdr.markForCheck();
      this.abrirModal();
    });
  }

  async guardarAlquiler() {
    try {
      const v = await firstValueFrom(this.servicioVehiculo.buscarVehiculo(this.placaSeleccionada));
      this.alquiler.vehiculo = v;

      this.servicioAlquiler.guardarAlquiler(this.alquiler).subscribe(dato => {
        this.cerrarModal();
        alert("Su solicitud de alquiler fue procesada con éxito");
        this.alquiler = new AlquilerE();
        this.placaSeleccionada = "";
        this.listarAlquileres();
      });
    } catch (error) {
      console.error('Error al buscar vehículo:', error);
    }
  }

 eliminar(idAlquiler: number) {
  this.servicioAlquiler.eliminarAlquiler(idAlquiler).subscribe(dato => {
    console.log(dato);
    this.listarAlquileres();
  });
}

cancelar(idAlquiler: number) {
  this.servicioAlquiler.cancelarAlquiler(idAlquiler).subscribe(mensaje => {
    alert(mensaje);
    this.eliminar(idAlquiler); 
  });
}

  entregar(placa: string) {
    this.servicioAlquiler.entregarPorPlaca(placa).subscribe(mensaje => {
      alert(mensaje);
      this.listarAlquileres();
    });
  }

  devolver(idAlquiler: number) {
    this.servicioAlquiler.devolverVehiculo(idAlquiler).subscribe(alquilerFinalizado => {
      alert(`Vehículo devuelto con éxito. Valor total cobrado: $${alquilerFinalizado.valorAlquiler}`);
      this.listarAlquileres();
    });
  }

  abrirModal() {
    const modal = document.getElementById("registro");
    if (modal != null) modal.style.display = 'block';
  }

  cerrarModal() {
    const modal = document.getElementById("registro");
    if (modal != null) modal.style.display = 'none';
  }

  cerrarSesion() {
    this.dataService.limpiar();
    this.usuario = null;
    this.router.navigate(['/login']);
  }
}