import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlquilerE } from '../Entidades/alquiler';

@Injectable({
  providedIn: 'root',
})
export class AlquilerService {

  constructor(private httpCliente: HttpClient) { }

  private listaA = 'http://localhost:8080/alquileres/a/listarTodo/';
  private guardarA = 'http://localhost:8080/alquileres/a/guardar/';
  private cancelarA = 'http://localhost:8080/alquileres/a/cancelar/';
  private entregarP = 'http://localhost:8080/alquileres/a/entregarPorPlaca/';
  private devolverA = 'http://localhost:8080/alquileres/a/devolver/';

  listarAlquileres(): Observable<any> {
    return this.httpCliente.get(this.listaA);
  }

  guardarAlquiler(alquiler: AlquilerE): Observable<any> {
    return this.httpCliente.post(`${this.guardarA}`, alquiler);
  }

  cancelarAlquiler(idAlquiler: number): Observable<any> {
    return this.httpCliente.post(`${this.cancelarA}`, null, { params: { idAlquiler: idAlquiler.toString() } });
  }

  entregarPorPlaca(placa: string): Observable<any> {
    return this.httpCliente.post(`${this.entregarP}`, null, { params: { placa: placa } });
  }

  devolverVehiculo(idAlquiler: number): Observable<any> {
    return this.httpCliente.post(`${this.devolverA}`, null, { params: { idAlquiler: idAlquiler.toString() } });
  }
}