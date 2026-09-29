import { Injectable, Service } from '@angular/core';
import { UsuarioEntidad } from '../Entidades/usuario-entidad';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

    private registro = 'http://localhost:8080/usuarios/u/guardarUsuario/';

    private login = 'http://localhost:8080/usuarios/u/login/';

    constructor(private httpCliente: HttpClient) {}

    registrarUsuario(usuario: UsuarioEntidad): Observable<any> {
    return this.httpCliente.post(`${this.registro}`, usuario);
    }

    InicioSesion(identificacion: string, contrasena: string): Observable<any> {
    return this.httpCliente.get(`${this.login}`,{params:{identificacion:identificacion, contrasena: contrasena}});
    }




} 
