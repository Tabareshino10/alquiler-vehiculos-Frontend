import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VehiculoE } from '../Entidades/vehiculo';

@Injectable({
  providedIn: 'root',
})

export class VehiculoService {

  constructor(private httpCliente: HttpClient) { }

  private listaV = 'https://alquiler-vehiculos-backend-1.onrender.com/vehiculos/v/listarTodo/';
  private guardarV = 'https://alquiler-vehiculos-backend-1.onrender.com/vehiculos/v/guardar/';
  private eliminarV = 'https://alquiler-vehiculos-backend-1.onrender.com/vehiculos/v/eliminarVehiculo';
  private buscarPlaca = 'https://alquiler-vehiculos-backend-1.onrender.com/vehiculos/v/buscarPlaca/';
  private buscarDisponiblesTipo = 'https://alquiler-vehiculos-backend-1.onrender.com/vehiculos/v/buscarDisponiblesTipo/';
  private buscarEstado = 'https://alquiler-vehiculos-backend-1.onrender.com/vehiculos/v/buscarEstado/';

  listarVehiculos(): Observable<any> {
    return this.httpCliente.get(this.listaV);
  }

  guardarVehiculo(vehiculo: VehiculoE): Observable<any> {
    return this.httpCliente.post(`${this.guardarV}`, vehiculo);
  }

  buscarVehiculo(placa: string): Observable<any> {
    return this.httpCliente.get(`${this.buscarPlaca}`, { params: { placa: placa } });
  }

  eliminarVehiculo(placa: string): Observable<any> {
    return this.httpCliente.post(`${this.eliminarV}`, placa);
  }

  buscarDisponiblesPorTipo(idTipoVehiculo: string): Observable<any> {
    return this.httpCliente.post(`${this.buscarDisponiblesTipo}`, null, { params: { idTipoVehiculo: idTipoVehiculo } });
  }

  buscarPorEstado(estado: string): Observable<any> {
    return this.httpCliente.get(`${this.buscarEstado}`, { params: { estado: estado } });
  }
}