// Optimizador de barras de perfil con espesor de sierra, en mm. Puro: sin storage ni estado.
//
// Las piezas con inglete se miden por la punta larga y se alternan en la barra (una con la punta
// larga arriba, la siguiente abajo), así que cada corte consume solo el espesor del disco. El ahorro
// que da ese encaje no se descuenta: la longitud de cada pieza es su punta larga, del lado seguro.
//
// Una barra con n piezas necesita la suma de las piezas más n − 1 cortes; el corte que separa el
// sobrante solo existe si queda sobrante. First Fit Decreasing, como el optimizador de las ventanas.

export interface OpcionesBarras {
    longitudBarra: number
    espesorSierra: number
}

export interface BarraCortada {
    // Longitudes de las piezas, de mayor a menor.
    piezas: number[]
    // Lo que queda de la barra después del último corte (0 si las piezas la llenan).
    sobrante: number
}

export interface ResultadoBarras {
    barras: BarraCortada[]
    // Suma de las piezas, sin cortes ni sobrantes.
    consumoNeto: number
    sobranteTotal: number
}

const ocupado = (piezas: readonly number[], espesorSierra: number) =>
    piezas.reduce((suma, pieza) => suma + pieza, 0) + Math.max(piezas.length - 1, 0) * espesorSierra

export function optimizarBarras(longitudes: readonly number[], { longitudBarra, espesorSierra }: OpcionesBarras): ResultadoBarras {
    const demasiadoLarga = longitudes.find((longitud) => longitud > longitudBarra)
    if (demasiadoLarga !== undefined) {
        throw new Error(`Una pieza de ${demasiadoLarga} mm no cabe en una barra de ${longitudBarra} mm`)
    }

    const barras: number[][] = []
    for (const longitud of [...longitudes].sort((a, b) => b - a)) {
        const barra = barras.find((piezas) => ocupado(piezas, espesorSierra) + espesorSierra + longitud <= longitudBarra)
        if (barra) barra.push(longitud)
        else barras.push([longitud])
    }

    const cortadas = barras.map((piezas) => {
        const restante = longitudBarra - ocupado(piezas, espesorSierra)
        return { piezas, sobrante: Math.max(restante - espesorSierra, 0) }
    })
    return {
        barras: cortadas,
        consumoNeto: longitudes.reduce((suma, longitud) => suma + longitud, 0),
        sobranteTotal: cortadas.reduce((suma, barra) => suma + barra.sobrante, 0),
    }
}
