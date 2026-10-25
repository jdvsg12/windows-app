import type { AccesorioPuerta, ReferenciaPerfilPuerta } from "./calculo/motor-puerta-alumina"

// Catálogo de la puerta abatible Alumina (sistema europeo): nombre, especificación e imagen técnica
// de cada perfil y accesorio. Las imágenes son las que entregó el taller (public/productos/alumina);
// lo que no tiene imagen entregada queda sin imagen, no con una genérica.

export interface ItemCatalogoAlumina {
    nombre: string
    especificacion: string
    imagen?: string
}

export const PUERTA_ALUMINA = {
    fabricante: "Alumina",
    sistema: "Europeo",
    nombre: "Puerta abatible Alumina",
} as const

export const PERFILES_PUERTA_ALUMINA: Record<ReferenciaPerfilPuerta, ItemCatalogoAlumina> = {
    "U-57": {
        nombre: "U-57 · Marco",
        especificacion: "76,2 × 25,4 mm; aleta de 12,7 mm a 35 mm",
        imagen: "/productos/alumina/u-57.png",
    },
    "VP-1102": {
        nombre: "VP-1102 · Bastidor de la hoja",
        especificacion: "105 × 38,1 mm (90 mm interior), con adaptador para el vidrio",
        imagen: "/productos/alumina/vp-1102.png",
    },
    "PISAVIDRIO-CUADRADO": {
        nombre: "Pisavidrio cuadrado",
        especificacion: "Compatible con VP-1102 y su adaptador",
    },
}

export const ACCESORIOS_PUERTA_ALUMINA: Record<AccesorioPuerta, ItemCatalogoAlumina> = {
    bisagraOmega: {
        nombre: "Bisagra Omega",
        especificacion: "Para puerta de aluminio",
        imagen: "/productos/alumina/bisagra-omega.png",
    },
    tornilloBisagra: { nombre: "Tornillo de bisagra", especificacion: '#8 × ½", cabeza avellanada' },
    cerraduraKL: {
        nombre: "Cerradura de palanca tubular KL",
        especificacion: "Cerradura tubular",
        imagen: "/productos/alumina/cerradura-kl-102e.png",
    },
    escuadraEnsamble: {
        nombre: "Escuadra de ensamble",
        especificacion: "Sistema europeo",
        imagen: "/productos/alumina/escuadra-ensamble.png",
    },
    anguloArme: { nombre: "Ángulo de arme", especificacion: '7½" (190,5 mm)' },
    tornilloInstalacion: { nombre: "Tornillo de instalación", especificacion: '#10 × 3"' },
}
