import { Component, inject } from '@angular/core';
import { Router, RouterLink,  } from '@angular/router';
import { UsuarioEntidad } from '../Entidades/usuario-entidad';
import { UsuarioService } from '../servicios/usuario-service';
import { FormsModule } from '@angular/forms';
import { EnviarDatosService } from '../servicios/enviar-datos-service';

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {

  usuario: UsuarioEntidad = new UsuarioEntidad();

  private dataService = inject(EnviarDatosService);
  
  private router = inject(Router);
  
  confirmarContrasena: string = '';

  constructor(private usuarioService: UsuarioService) {}

  registrar(){

    if (!this.usuario.identificacion || !this.usuario.correo || !this.usuario.contrasena || !this.usuario.nombreCompleto 
      || !this.usuario.categoria || !this.usuario.fechaLicencia || !this.usuario.vigencia || !this.usuario.telefono) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (this.usuario.contrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }
    this.usuario.rol = 'Usuario';

    this.usuarioService.registrarUsuario(this.usuario).subscribe(
      dato => {
        console.log('Usuario guardado:', dato);
        alert('¡Usuario registrado con éxito!');
        
        this.enviar(dato);
        this.usuario = new UsuarioEntidad();
        this.confirmarContrasena = '';
      },
      error => {
        console.error('Error al guardar:', error);
        alert('Ocurrió un error al registrar el usuario. Verifique los datos o si el correo ya existe.');
      }
    );
  }

  enviar(u: any) {
  console.log(u);
  this.dataService.enviar(u);
  this.router.navigate(['/home']);
}

}
