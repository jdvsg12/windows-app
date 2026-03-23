import { getDescuentos, getSistemasDisponibles } from "./descuentos"
import type { DescuentosSistema } from "./types"

export class CalculadoraSistema {
  protected descuentos: DescuentosSistema
  protected sistema: string

  constructor(sistema: string) {
    this.sistema = sistema
    this.descuentos = getDescuentos(sistema)
  }

  getSistema(): string {
    return this.sistema
  }

  getDescuentos(): DescuentosSistema {
    return this.descuentos
  }

  calcularAltoVidrio(alto: number): number {
    return alto - this.descuentos.jamba
  }

  calcularAnchoVidrio(ancho: number, cantidadHojas: number): number {
    const anchoPorHoja = ancho / cantidadHojas
    return anchoPorHoja - this.descuentos.anchoVidrio
  }

  calcularAltoEnganche(alto: number, conFijaParche: boolean = false): number {
    const descuento = conFijaParche ? 5 : this.descuentos.enganche
    return alto - descuento
  }

  calcularAltoTraslape(alto: number, conFijaParche: boolean = false): number {
    const descuento = conFijaParche ? 5 : this.descuentos.traslape
    return alto - descuento
  }

  calcularHorizontal(ancho: number, cantidadHojas: number): number {
    const anchoPorHoja = ancho / cantidadHojas
    return anchoPorHoja - this.descuentos.hInfSup
  }

  calcularJamba(alto: number): number {
    return alto - this.descuentos.jamba
  }
}

export function crearCalculadora(sistema: string): CalculadoraSistema {
  return new CalculadoraSistema(sistema)
}

export { getSistemasDisponibles }
