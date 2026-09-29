import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VehiculoService } from '../servicios/vehiculo-service';
import { VehiculoE } from '../Entidades/vehiculo';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit(): void {
    this.listarVehiculos();
  }

  constructor(private cdr: ChangeDetectorRef, private servicioVehiculo: VehiculoService) { }

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
}