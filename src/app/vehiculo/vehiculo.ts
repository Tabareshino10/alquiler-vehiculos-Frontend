import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { VehiculoService } from '../servicios/vehiculo-service';
import { VehiculoE } from '../Entidades/vehiculo';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnviarDatosService } from '../servicios/enviar-datos-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AlquilerE } from '../Entidades/alquiler';
import { AlquilerService } from '../servicios/alquiler-service';
import { UsuarioService } from '../servicios/usuario-service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-vehiculo',
  imports: [NgFor, CommonModule, FormsModule, RouterLink, RouterLinkActive],
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

  dataService = inject(EnviarDatosService);
  private router = inject(Router);

  usuario: any = null;

  
  vehiculoSeleccionado: VehiculoE = new VehiculoE(); // Referencia local para evitar pérdida de datos

  ngOnInit(): void {
    this.listarVehiculos();
    const datoActual = this.dataService.usuarioSignal();
    
    if (datoActual) {
      this.usuario = datoActual;
    } else {
      // Recuperar sesión activa si se recarga la página
      const sesionLocal = localStorage.getItem('usuario');
      if (sesionLocal) {
        this.usuario = JSON.parse(sesionLocal);
      }
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private servicioVehiculo: VehiculoService,
    private servicioAlquiler: AlquilerService,
    private servicioUsuario: UsuarioService   
  ) { }

  private listarVehiculos() {
    this.servicioVehiculo.listarVehiculos().subscribe(dato => {
      this.listaV = dato;
      this.cdr.markForCheck();
    });
  }

  guardarVehiculo() {
    this.servicioVehiculo.guardarVehiculo(this.vehiculo).subscribe(dato => {
      this.cerrarModal();
      this.listarVehiculos();
    });
  }

  buscarPorPlaca() {
    this.listaV = [] as VehiculoE[];
    const p = document.getElementById("placaBusqueda") as HTMLInputElement;
    if (p && p.value) {
      this.servicioVehiculo.buscarVehiculo(p.value).subscribe(dato => {
        this.cdr.markForCheck();
        this.vehiculo = dato;
        if (this.vehiculo) {
          this.listaV.push(this.vehiculo);
        }
      });
    }
  }

  buscarPorTipoDisponibles() {
    const t = document.getElementById("tipoSelect") as HTMLInputElement;
    if (t) {
      this.servicioVehiculo.buscarDisponiblesPorTipo(t.value).subscribe(dato => {
        this.listaV = dato;
        this.cdr.markForCheck();
      });
    }
  }

  eliminar(placa: string) {
    this.servicioVehiculo.eliminarVehiculo(placa).subscribe(dato => {
      this.listarVehiculos();
    });
  }

  actualizar(v: VehiculoE) {
    this.vehiculo = v;
    this.abrirModal();
  }

  abrirModal() {
    const modal = document.getElementById("registro");
    if (modal != null) modal.style.display = 'block';
  }

  cerrarModal() {
    this.vehiculo = new VehiculoE();
    const modal = document.getElementById("registro");
    if (modal != null) modal.style.display = 'none';
  }


  // --- MÉTODOS DE SOLICITUD DE ALQUILER Y PDF ---

  elegirVehiculo(v: VehiculoE) {
    console.log("Vehículo seleccionado:", v);
    this.vehiculoSeleccionado = v;
    this.alquiler = new AlquilerE(); // Limpiar formulario anterior
    this.alquiler.vehiculo = v;
    
    // Autocompletar la cédula si hay usuario en sesión
    if (this.usuario && (this.usuario.identificacion || this.usuario.cc)) {
      this.cc = this.usuario.identificacion || this.usuario.cc;
    }
    
    this.solicitarAlquiler();
  }

  solicitarAlquiler() {
    const modal = document.getElementById("registroAlquiler");
    if (modal != null) modal.style.display = 'block';
  }

  cerrarModalAlquiler() {
    this.alquiler = new AlquilerE();
    this.cc = "";
    const modal = document.getElementById("registroAlquiler");
    if (modal != null) modal.style.display = 'none';
  }

  guardarAlquiler() {
    this.buscarUsuarioYGuardar();
  }

  async buscarUsuarioYGuardar() {
    try {
      // 1. Obtener información del usuario
      const usuarioEncontrado = await firstValueFrom(this.servicioUsuario.buscarUsuario(this.cc));
      this.alquiler.idUsuario = usuarioEncontrado.identificacion;
      this.alquiler.vehiculo = this.vehiculoSeleccionado;

      console.log("Objeto enviado al servidor:", this.alquiler);

      // 2. Guardar el alquiler en el backend
      this.servicioAlquiler.guardarAlquiler(this.alquiler).subscribe({
        next: (alquilerGuardado: any) => {
          console.log("Respuesta del servidor:", alquilerGuardado);
          this.cerrarModalAlquiler();
          alert("Su alquiler ha sido registrado con éxito. Generando comprobante...");

          // 3. Generación del documento PDF con la información requerida
          this.generarPDFComprobante(alquilerGuardado, usuarioEncontrado, this.vehiculoSeleccionado);

          this.listarVehiculos(); // Actualizar disponibilidad en pantalla
        },
        error: (err) => {
          console.error("Error al registrar el alquiler:", err);
          if (typeof err.error === 'string') {
            alert("Error: " + err.error);
          } else {
            alert("No se pudo guardar el alquiler. Verifique los datos o la disponibilidad.");
          }
        }
      });

    } catch (error) {
      console.error("Error al buscar usuario:", error);
      alert('No se pudo encontrar el usuario con la cédula ingresada.');
    }
  }

  cerrarSesion() {
    this.dataService.limpiar();
    this.usuario = null;
    this.router.navigate(['/login']);
  // 📄 IMPRESIÓN DE COMPROBANTE PDF
  generarPDFComprobante(alquilerResp: any, usuarioObj: any, vehiculoObj: VehiculoE) {
    const doc = new jsPDF();

    // Franja de encabezado
    doc.setFillColor(25, 135, 84); // Verde success
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MI CACHARRITO - COMPROBANTE DE ALQUILER', 15, 20);

    // --- 1. DATOS DEL ALQUILER ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Alquiler', 15, 42);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 45, 195, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const numAlquiler = alquilerResp?.idAlquiler || 'N/A';
    doc.text(`Número de Alquiler: #${numAlquiler}`, 15, 53);
    doc.text(`Fecha de Inicio: ${this.alquiler.fechaInicio || alquilerResp?.fechaInicio || 'N/A'}`, 15, 60);
    doc.text(`Fecha de Entrega Prevista: ${this.alquiler.fechaEntregaP || alquilerResp?.fechaEntregaP || 'N/A'}`, 15, 67);
    doc.text(`Valor del Alquiler: $${this.alquiler.valorAlquiler || alquilerResp?.valorAlquiler || 0}`, 15, 74);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 100, 0); // Tono de atención/pendiente
    doc.text(`Estado: pendiente de entrega`, 15, 81);

    // --- 2. DATOS DEL USUARIO ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Usuario', 15, 96);
    doc.line(15, 99, 195, 99);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const nombreUser = usuarioObj.nombreCompleto || usuarioObj.nombre || 'N/A';
    const idUser = usuarioObj.identificacion || usuarioObj.cc || 'N/A';
    doc.text(`Nombre del Usuario: ${nombreUser}`, 15, 107);
    doc.text(`Identificación: ${idUser}`, 15, 114);

    // --- 3. DATOS DEL VEHÍCULO ---
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Vehículo Alquilado', 15, 129);
    doc.line(15, 132, 195, 132);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const placaVehiculo = vehiculoObj?.placa || alquilerResp?.vehiculo?.placa || 'N/A';
    const tipoVehiculo = vehiculoObj?.idTipoVehiculo || vehiculoObj?.idTipoVehiculo || alquilerResp?.vehiculo?.idTipoVehiculo || 'N/A';
    const colorVehiculo = vehiculoObj?.color || alquilerResp?.vehiculo?.color || 'N/A';

    doc.text(`Placa: ${placaVehiculo}`, 15, 140);
    doc.text(`Tipo de Automóvil: ${tipoVehiculo}`, 15, 147);
    doc.text(`Color: ${colorVehiculo}`, 15, 154);

    // Pie de página
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Gracias por preferir Mi Cacharrito. Presente este comprobante al retirar su vehículo.', 15, 175);

    // Descarga del documento
    doc.save(`Comprobante_Alquiler_${numAlquiler}.pdf`);
  }
}
}