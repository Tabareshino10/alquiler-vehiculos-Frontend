import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EnviarDatosService {
    
  private platformId = inject(PLATFORM_ID);

  public usuarioSignal = signal<any>(this.obtenerUsuarioInicial());

  private obtenerUsuarioInicial() {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    }
    return null;
  }

  enviar(datosUsuario: any) {
    console.log('Guardando dato:', datosUsuario);
    this.usuarioSignal.set(datosUsuario);
    localStorage.setItem('usuarioActual', JSON.stringify(datosUsuario));
  }

  limpiar() {
    this.usuarioSignal.set(null);
    localStorage.removeItem('usuarioActual');
  }
}
