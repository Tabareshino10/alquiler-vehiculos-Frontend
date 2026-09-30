import { Injectable, Service } from '@angular/core';
import { UsuarioEntidad } from '../Entidades/usuario-entidad';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

    private registro = 'https://alquiler-vehiculos-backend-1.onrender.com/usuarios/u/guardarUsuario/';

    private login = 'https://alquiler-vehiculos-backend-1.onrender.com/usuarios/u/login/';

    private buscarU = 'https://alquiler-vehiculos-backend-1.onrender.com/usuarios/u/buscarCC/'

    constructor(private httpCliente: HttpClient) {}

    registrarUsuario(usuario: UsuarioEntidad): Observable<any> {
    return this.httpCliente.post(`${this.registro}`, usuario);
    }

    InicioSesion(identificacion: string, contrasena: string): Observable<any> {
    return this.httpCliente.get(`${this.login}`,{params:{identificacion:identificacion, contrasena: contrasena}});
    }



    buscarUsuario(identificacion: string) : Observable<any>{
    return this.httpCliente.get(`${this.buscarU}`,{params:{identificacion:identificacion}});
  }


} 
