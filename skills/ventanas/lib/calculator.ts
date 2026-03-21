import type { Panel, ResultadoPaneles, ResultadoVidrio, DebugDescuento, SistemaVentana } from "./types"
import { getDescuentos, getSistemasDisponibles } from "./descuentos"
import { crearCalculadora } from "./factory"

const MIN_PANEL = 1000

export function calcularPaneles(ancho: number, cantidad: number): ResultadoPaneles {
  const anchoPanelBase = ancho / cantidad

  if (anchoPanelBase < MIN_PANEL) {
    return {
      paneles: [],
      anchoPanelBase,
      esValido: false,
      error: `El ancho por panel (${anchoPanelBase}mm) es menor al mínimo de ${MIN_PANEL}mm`,
    }
  }

  const paneles: Panel[] = []
  const tieneFijaParche = cantidad >= 3
  const hojasMoviles = cantidad - (tieneFijaParche ? 1 : 0)

  for (let i = 0; i < cantidad; i++) {
    const numero = i + 1
    let tipo: "movil" | "fijo" | "fijo-parche"
    let perfilEnganche: "izq" | "der" | "ambos" | "ninguno"
    let perfilTraslape: boolean
    let anchoPanel = anchoPanelBase

    if (i === 0) {
      tipo = "movil"
      anchoPanel = anchoPanelBase + 100
      perfilEnganche = "der"
      perfilTraslape = false
    } else if (i === cantidad - 1) {
      if (tieneFijaParche) {
        tipo = "fijo-parche"
        perfilEnganche = "izq"
        perfilTraslape = true
      } else {
        tipo = "fijo"
        perfilEnganche = "izq"
        perfilTraslape = true
      }
    } else {
      tipo = "movil"
      perfilEnganche = "ambos"
      perfilTraslape = false
    }

    paneles.push({
      numero,
      ancho: Math.round(anchoPanel * 100) / 100,
      tipo,
      perfilEnganche,
      perfilTraslape,
    })
  }

  return {
    paneles,
    anchoPanelBase,
    esValido: true,
  }
}

export function calcularVidrio(
  ancho: number,
  alto: number,
  sistema: string = "5020"
): ResultadoVidrio {
  const calc = crearCalculadora(sistema)
  const descuentos = calc.getDescuentos()

  const cantidadHojas = Math.ceil(ancho / 1000)
  const anchoPorHoja = ancho / cantidadHojas
  const anchoVidrio = anchoPorHoja - descuentos.anchoVidrio
  const altoVidrio = alto - descuentos.jamba
  const area = (anchoVidrio * altoVidrio) / 1000000

  return {
    anchoVidrio: Math.round(anchoVidrio * 100) / 100,
    altoVidrio: Math.round(altoVidrio * 100) / 100,
    area: Math.round(area * 1000) / 1000,
  }
}

export function debugDescuentos(ancho: number = 100, alto: number = 100): DebugDescuento[] {
  const sistemas = getSistemasDisponibles()
  const resultados: DebugDescuento[] = []

  for (const sistema of sistemas) {
    const calc = crearCalculadora(sistema)
    const d = calc.getDescuentos()

    resultados.push({
      perfil: `${sistema} - JAMBA`,
      medidaOriginal: alto,
      descuento: d.jamba,
      medidaFinal: alto - d.jamba,
    })

    resultados.push({
      perfil: `${sistema} - ENGANCHE`,
      medidaOriginal: alto,
      descuento: d.enganche,
      medidaFinal: alto - d.enganche,
    })

    resultados.push({
      perfil: `${sistema} - TRASLAPE`,
      medidaOriginal: alto,
      descuento: d.traslape,
      medidaFinal: alto - d.traslape,
    })

    resultados.push({
      perfil: `${sistema} - H INF/SUP`,
      medidaOriginal: ancho / 2,
      descuento: d.hInfSup,
      medidaFinal: ancho / 2 - d.hInfSup,
    })

    resultados.push({
      perfil: `${sistema} - ANCHO VIDRIO`,
      medidaOriginal: ancho / 2,
      descuento: d.anchoVidrio,
      medidaFinal: ancho / 2 - d.anchoVidrio,
    })
  }

  return resultados
}

export function listarSistemas(): string[] {
  return getSistemasDisponibles()
}

export function mostrarDescuentos(sistema?: string): string {
  if (sistema) {
    const calc = crearCalculadora(sistema)
    const d = calc.getDescuentos()
    return `
Sistema: ${sistema}
- JAMBA: ${d.jamba}mm
- ENGANCHE: ${d.enganche}mm
- TRASLAPE: ${d.traslape}mm
- H INF/SUP: ${d.hInfSup}mm
- ANCHO VIDRIO: ${d.anchoVidrio}mm
`.trim()
  }

  return `
Sistemas disponibles: ${getSistemasDisponibles().join(", ")}
Usa: descuentos <sistema> para ver los descuentos específicos
`.trim()
}
