import { UsuarioEntidad } from './usuario-entidad';

declare function describe(description: string, specDefinitions: () => void): void;
declare function it(description: string, testFunction: () => void): void;
declare function expect(actual: unknown): { toBeTruthy(): void };

describe('UsuarioEntidad', () => {
  it('should create an instance', () => {
    expect(new UsuarioEntidad()).toBeTruthy();
  });
});
