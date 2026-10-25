import type { TipoCerradura, TipoRodachina } from "./types"

// Catálogo de la ventana corrediza 80-25: referencia comercial e imagen de cada perfil y accesorio.
// Dibujos de perfil: catálogo de Ventanas y Puertas (ventanasypuertas.com.co); fotos de accesorios:
// las que entregó el taller. Lo que no tiene imagen queda sin imagen, no con una genérica.

export interface ItemCatalogo {
    nombre: string
    referencia?: string
    detalle?: string
    imagen?: string
}

// Por tipo de perfil del motor 8025 ("Cabezal", "Jamba Izquierda"…). Las dos jambas son la misma
// referencia: en la lista de compra se suman.
export const PERFILES_8025: Record<string, ItemCatalogo & { referencia: string }> = {
    Cabezal: { nombre: "Cabezal 8025", referencia: "VP151", imagen: "/productos/8025/vp151.jpg" },
    Sillar: { nombre: "Sillar 8025", referencia: "VP150", imagen: "/productos/8025/vp150.jpg" },
    "Jamba Izquierda": { nombre: "Jamba 8025", referencia: "VP152", imagen: "/productos/8025/vp152.jpg" },
    "Jamba Derecha": { nombre: "Jamba 8025", referencia: "VP152", imagen: "/productos/8025/vp152.jpg" },
    Enganche: { nombre: "Enganche 8025", referencia: "VP191", imagen: "/productos/8025/vp191.jpg" },
    Traslape: { nombre: "Traslape 8025", referencia: "VP190", imagen: "/productos/8025/vp190.jpg" },
    "Horizontal Superior": { nombre: "Horizontal superior 8025", referencia: "VP156", imagen: "/productos/8025/vp156.jpg" },
    "Horizontal Inferior": { nombre: "Horizontal inferior 8025", referencia: "VP157", imagen: "/productos/8025/vp157.jpg" },
}

export const RODACHINAS_8025: Record<TipoRodachina, ItemCatalogo> = {
    plastica: { nombre: "Rodachina plástica", imagen: "/productos/accesorios/rodachina-plastica.png" },
    metalica: { nombre: "Rodachina metálica", detalle: "Acero", imagen: "/productos/accesorios/rodachina-metalica.png" },
    pabose: { nombre: "Rodachina pabose", imagen: "/productos/accesorios/rodachina-pabose.png" },
}

export const CERRADURAS_8025: Record<TipoCerradura, ItemCatalogo> = {
    impacto: { nombre: "Cerradura impacto", imagen: "/productos/accesorios/cerradura-impacto.png" },
    dummy: { nombre: "Cerradura dummy", imagen: "/productos/accesorios/cerradura-dummy.webp" },
    manija: { nombre: "Cerradura manija" },
}

export const OTROS_ACCESORIOS_8025 = {
    guia: { nombre: "Guía", detalle: "Superior e inferior", imagen: "/productos/accesorios/guia.png" },
    empaque: { nombre: "Empaque", detalle: "Para el vidrio de las hojas", imagen: "/productos/accesorios/empaque.png" },
    tornilloMarcoHojas: { nombre: "Tornillo de marco y hojas", detalle: "8 mm" },
    tornilloInstalacion: { nombre: "Tornillo de instalación", detalle: "10 mm, ventanas" },
} as const satisfies Record<string, ItemCatalogo>
