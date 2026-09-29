import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VehiculoService } from '../servicios/vehiculo-service';
import { VehiculoE } from '../Entidades/vehiculo';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AlquilerE } from '../Entidades/alquiler';
import { AlquilerService } from '../servicios/alquiler-service';
import { UsuarioService } from '../servicios/usuario-service';

@Component({
  selector: 'app-vehiculo',
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.css',
})
export class Vehiculo implements OnInit {

  texto: string = "";
  listaV: VehiculoE[] = [];
  vehiculo: VehiculoE = new VehiculoE();

  // 🟢 NUEVAS VARIABLES PARA EL ALQUILER
  alquiler: AlquilerE = new AlquilerE();
  cc: string = "";

  ngOnInit(): void {
    this.listarVehiculos();
  }

  // 🟢 CONSTRUCTOR CON SERVICIOS AGREGADOS (Mantiene los que tenías)
  constructor(
    private cdr: ChangeDetectorRef,
    private servicioVehiculo: VehiculoService,
    private servicioAlquiler: AlquilerService,  // 👈 Nuevo
    private servicioUsuario: UsuarioService    // 👈 Nuevo
  ) { }

  private listarVehiculos() {
    this.servicioVehiculo.listarVehiculos().subscribe(dato => {
      this.listaV = dato;
      this.cdr.markForCheck();
      console.log(this.listaV);
    });
  }

  guardarVehiculo() {
    this.servicioVehiculo.guardarVehiculo(this.vehiculo).subscribe(dato => {
      this.cerrarModal();
      console.log(dato);
      this.listarVehiculos();
    });
  }

  buscarPorPlaca() {
    this.listaV = [] as VehiculoE[];
    const p = document.getElementById("placaBusqueda") as HTMLInputElement;
    console.log(p.value);
    this.servicioVehiculo.buscarVehiculo(p.value).subscribe(dato => {
      this.cdr.markForCheck();
      console.log(dato);
      this.vehiculo = dato;
      if (this.vehiculo) {
        this.listaV.push(this.vehiculo);
      }
      console.log(this.listaV);
    });
  }

  buscarPorTipoDisponibles() {
    const t = document.getElementById("tipoSelect") as HTMLInputElement;
    this.servicioVehiculo.buscarDisponiblesPorTipo(t.value).subscribe(dato => {
      this.listaV = dato;
      this.cdr.markForCheck();
    });
  }

  eliminar(placa: string) {
    this.servicioVehiculo.eliminarVehiculo(placa).subscribe(dato => {
      console.log(dato);
      this.listarVehiculos();
    });
  }


  actualizar(v: VehiculoE) {
    this.vehiculo = v;
    this.abrirModal();
  }

  abrirModal() {
    const modal = document.getElementById("registro");
    if (modal != null)
      modal.style.display = 'block';
  }

  cerrarModal() {
    this.vehiculo = new VehiculoE();
    const modal = document.getElementById("registro");
    if (modal != null)
      modal.style.display = 'none';
  }

  // 🟢 NUEVOS MÉTODOS PARA EL ALQUILER

  elegirVehiculo(v: VehiculoE) {
    console.log("Vehículo seleccionado:", v);
    this.alquiler.vehiculo = v;
    this.solicitarAlquiler();
  }

  solicitarAlquiler() {
    const modal = document.getElementById("registroAlquiler");
    if (modal != null)
      modal.style.display = 'block';
  }

  cerrarModalAlquiler() {
    this.alquiler = new AlquilerE(); // Esto limpiará fechas, vehículo y usuario
    this.cc = ""; // Limpia la cédula
    const modal = document.getElementById("registroAlquiler");
    if (modal != null) {
      modal.style.display = 'none';
    }
  }

  guardarAlquiler() {
    this.buscarUsuarioYGuardar();
  }

  async buscarUsuarioYGuardar() {
    try {
      // 1. Buscar el usuario
      const usuario = await firstValueFrom(this.servicioUsuario.buscarUsuario(this.cc));
      console.log("Usuario encontrado:", usuario);

      // 2. Asignar el idUsuario (asumiendo que en tu usuario la cedula viene en 'identificacion' o 'idUsuario')
      this.alquiler.idUsuario = usuario.identificacion;

      // 3. Confirmar que la placa esté en el objeto vehiculo
      console.log("Objeto alquiler enviado al backend:", this.alquiler);

      // 4. Enviar al backend
      this.servicioAlquiler.guardarAlquiler(this.alquiler).subscribe({
        next: (dato) => {
          console.log("Alquiler guardado con éxito:", dato);
          this.cerrarModalAlquiler();
          alert("Su alquiler ha sido asignado con éxito");
          this.listarVehiculos(); // Refresca lista para ver el cambio de estado a 'alquilado'
        },
        error: (err) => {
          console.error("Error devuelto por Spring Boot:", err);
          // Si el backend devuelve un mensaje textual en el body del error 400:
          if (typeof err.error === 'string') {
            alert("Error: " + err.error);
          } else {
            alert("No se pudo guardar el alquiler. Verifique que el vehículo esté disponible.");
          }
        }
      });

    } catch (error) {
      console.error('Error al buscar el usuario:', error);
      alert('No se pudo encontrar el usuario con la cédula ingresada');
    }
  }
}