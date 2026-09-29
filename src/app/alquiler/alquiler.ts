import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlquilerService } from '../servicios/alquiler-service';
import { VehiculoService } from '../servicios/vehiculo-service';
import { AlquilerE } from '../Entidades/alquiler';
import { VehiculoE } from '../Entidades/vehiculo';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-alquiler',
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './alquiler.html',
  styleUrl: './alquiler.css',
})
export class Alquiler implements OnInit {

  listaA: AlquilerE[] = [];
  vehiculosDisponibles: VehiculoE[] = [];
  alquiler: AlquilerE = new AlquilerE();
  placaSeleccionada: string = "";

  ngOnInit(): void {
    this.listarAlquileres();
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
      console.log(this.listaA);
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
        console.log(dato);
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

  cancelar(idAlquiler: number) {
    this.servicioAlquiler.cancelarAlquiler(idAlquiler).subscribe(dato => {
      console.log(dato);
      this.listarAlquileres();
    });
  }

  entregar(placa: string) {
    this.servicioAlquiler.entregarPorPlaca(placa).subscribe(dato => {
      console.log(dato);
      this.listarAlquileres();
    });
  }

  devolver(idAlquiler: number) {
    this.servicioAlquiler.devolverVehiculo(idAlquiler).subscribe(dato => {
      console.log(dato);
      this.listarAlquileres();
    });
  }

  abrirModal() {
    const modal = document.getElementById("registro");
    if (modal != null)
      modal.style.display = 'block';
  }

  cerrarModal() {
    const modal = document.getElementById("registro");
    if (modal != null)
      modal.style.display = 'none';
  }
}