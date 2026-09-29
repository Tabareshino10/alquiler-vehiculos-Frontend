import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../servicios/usuario-service';
import { EnviarDatosService } from '../servicios/enviar-datos-service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  identificacion: string = ''; 
  contrasena: string = '';

  private usuarioService = inject(UsuarioService);
  private dataService = inject(EnviarDatosService);
  private router = inject(Router);

  iniciarSesion(): void {
  
    if (!this.identificacion || !this.contrasena) {
      alert('Por favor complete todos los campos.');
      return;
    }

    this.usuarioService.InicioSesion(this.identificacion, this.contrasena).subscribe(
      dato => {
        console.log('Login exitoso:', dato);
        alert('¡Bienvenido!');

        this.enviar(dato);
      },
      error => {
        console.error('Error al iniciar sesión:', error);
        alert('identificacion o contraseña incorrectos.');
      }
    );
  }

  enviar(u: any): void {
    console.log('Usuario en línea:', u);
    this.dataService.enviar(u);
    this.router.navigate(['/home']);
  }
}
