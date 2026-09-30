import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlquilerE } from '../Entidades/alquiler';

@Injectable({
  providedIn: 'root',
})
export class AlquilerService {

  constructor(private httpCliente: HttpClient) { }

  private listaA = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/listarTodo/';
  private guardarA = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/guardar/';
  private cancelarA = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/cancelar/';
  private entregarP = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/entregarPorPlaca/';
  private devolverA = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/devolver/';
  private eliminarA = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/eliminar/';
  private listarUser = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/listarPorUsuario/';
  private buscarA = 'https://alquiler-vehiculos-backend-1.onrender.com/alquileres/a/buscarId/'

  listarAlquileres(): Observable<AlquilerE[]> {
    return this.httpCliente.get<AlquilerE[]>(this.listaA);
  }

  guardarAlquiler(alquiler: AlquilerE): Observable<any> {
    return this.httpCliente.post(`${this.guardarA}`, alquiler);
  }

  cancelarAlquiler(idAlquiler: number): Observable<string> {
    return this.httpCliente.post(this.cancelarA, null, { params: { idAlquiler: idAlquiler.toString() }, responseType: 'text' });
  }

  entregarPorPlaca(placa: string): Observable<string> {
    return this.httpCliente.post(this.entregarP, null, { params: { placa: placa }, responseType: 'text' });
  }
  
  devolverVehiculo(idAlquiler: number, fechaEntregaR: string): Observable<any> {
    return this.httpCliente.post(this.devolverA, null, { params: {idAlquiler: idAlquiler.toString(),fechaEntregaR: fechaEntregaR}
    });
  }

  eliminarAlquiler(idAlquiler: number): Observable<any> {
    return this.httpCliente.post(`${this.eliminarA}`, null, { params: { idAlquiler: idAlquiler.toString() }, responseType: 'text' });
  }

  listarAlquileresPorUsuario(idUsuario: number): Observable<AlquilerE[]> {
    return this.httpCliente.get<AlquilerE[]>(this.listarUser, { params: { idUsuario: idUsuario } });
  }

   buscarAlquiler(idAlquiler: number): Observable<string> {
    return this.httpCliente.post(this.buscarA, null, { params: { idAlquiler: idAlquiler }, responseType: 'text' });
  }
}