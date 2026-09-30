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
  imports: [NgFor, CommonModule, FormsModule, RouterLink, RouterLinkActive,],
  templateUrl: './alquiler.html',
  styleUrl: './alquiler.css',
})
export class Alquiler implements OnInit {

  listaA: AlquilerE[] = [];
  vehiculosDisponibles: VehiculoE[] = [];
  alquiler: AlquilerE = new AlquilerE();
  placaSeleccionada: string = "";
  valorTotalCobrado: number = 0;
  idAlquilerProcesar: number = 0;
  fechaDevolucion: string = "";
  dataService = inject(EnviarDatosService);
  private router = inject(Router);

  usuario: any = null;

  ngOnInit(): void {

    let datoActual = this.dataService.usuarioSignal();
    console.log("Dato de Signal al iniciar:", datoActual.identificacion);

    if (!datoActual) {
      const usuarioStorage = localStorage.getItem('usuarioActual');
      if (usuarioStorage) {
        datoActual = JSON.parse(usuarioStorage);
        console.log("Dato de LocalStorage al iniciar:", datoActual.identificacion);
      }
    }

    if (datoActual) {
      this.usuario = datoActual;

      console.log("Usuario asignado por completo:", this.usuario.identificacion);


      this.listarAlquileres();
    } else {
      console.warn("No se encontró ningún usuario logueado. Redirigiendo...");
      this.router.navigate(['/login']);
    }
  }
  constructor(
    private servicioAlquiler: AlquilerService,
    private servicioVehiculo: VehiculoService,
    private cdr: ChangeDetectorRef
  ) { }

  private listarAlquileres() {

    if (!this.usuario) {
      console.warn("No hay un usuario en sesión.");
      return;
    }
    const idUsuario = this.usuario.identificacion || this.usuario.identificacion;
    const rol = this.usuario.rol;


    if (rol === 'ADMIN') {
      this.servicioAlquiler.listarAlquileres().subscribe(dato => {
        this.listaA = dato;
        this.cdr.markForCheck();
      });
    } else {
      this.servicioAlquiler.listarAlquileresPorUsuario(idUsuario).subscribe(dato => {
        this.listaA = dato;
        this.cdr.markForCheck();
      });
    }
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

  buscarPorId() {
    this.listaA = [];
    const p = document.getElementById("idBusqueda") as HTMLInputElement;

    if (p && p.value) {
      const id = Number(p.value); // Convertimos el string del input a number

      this.servicioAlquiler.buscarAlquiler(id).subscribe({
        next: (dato: AlquilerE | string | null) => {
          if (dato) {
            const alquilerEncontrado = typeof dato === 'string'
              ? (JSON.parse(dato) as AlquilerE)
              : (dato as AlquilerE);

            this.alquiler = alquilerEncontrado;
            this.listaA = [alquilerEncontrado]; // Reemplazamos la lista directamente con el resultado
          } else {
            this.listaA = [];
            alert("No se encontró ningún alquiler con ese ID.");
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Error al buscar por ID:", err);
          this.listaA = [];
          this.cdr.markForCheck();
        }
      });
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
  abrirModalDevolucion(idAlquiler?: number) {
    if (!idAlquiler) {
      alert("El alquiler no tiene un ID válido.");
      return;
    }

    this.idAlquilerProcesar = idAlquiler;
    this.fechaDevolucion = ""; // Limpiar el input
    const modal = document.getElementById("modalDevolucion");
    if (modal != null) modal.style.display = 'block';
  }

  cerrarModalDevolucion() {
    const modal = document.getElementById("modalDevolucion");
    if (modal != null) modal.style.display = 'none';
  }

  confirmarDevolucion() {
    if (!this.fechaDevolucion) {
      alert("Por favor, seleccione la fecha real de entrega.");
      return;
    }

    this.servicioAlquiler.devolverVehiculo(this.idAlquilerProcesar, this.fechaDevolucion).subscribe({
      next: (alquilerFinalizado) => {
        // 1. Guardamos el valor calculado para mostrarlo en el modal
        this.valorTotalCobrado = alquilerFinalizado.valorAlquiler;

        // 2. Eliminamos el registro de la BD
        this.servicioAlquiler.eliminarAlquiler(this.idAlquilerProcesar).subscribe({
          next: () => {
            this.cerrarModalDevolucion(); // Cierra el modal de la fecha
            this.abrirModalExito();      // Abre el modal de confirmación con el precio
          },
          error: (err) => console.error("Error al eliminar el registro", err)
        });
      },
      error: (err) => {
        console.error("Error en la devolución", err);
        alert("No se pudo procesar la devolución.");
      }
    });
  }

  // Métodos para controlar el modal de éxito
  abrirModalExito() {
    const modal = document.getElementById("modalExitoDevolucion");
    if (modal != null) modal.style.display = 'block';
    this.cdr.markForCheck();
  }

  cerrarModalExito() {
    const modal = document.getElementById("modalExitoDevolucion");
    if (modal != null) modal.style.display = 'none';
    this.listarAlquileres(); // Actualiza las tarjetas al cerrar
  }
}
