import { VehiculoE } from './vehiculo';

export class AlquilerE {
  idAlquiler?: number;
  idUsuario: number = 0;
  vehiculo: VehiculoE = new VehiculoE();
  fechaInicio: string = '';
  fechaEntregaP: string = '';
  fechaEntregaR?: string = '';
  valorAlquiler: number = 0;
  estado: string = '';
}