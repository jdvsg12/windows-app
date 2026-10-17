// Helpers for the "price per type" maps in ConfiguracionPrecios (glass by color/thickness,
// lock and roller by type): an absent key means "use the general price".

export function conPrecioOpcional<K extends string>(
    precios: Partial<Record<K, number>>,
    clave: K,
    valor: number | undefined
): Partial<Record<K, number>> {
    const nuevos = { ...precios }
    if (valor === undefined) delete nuevos[clave]
    else nuevos[clave] = valor
    return nuevos
}

// What a price input holds: empty, zero, negative or not a number all mean "no own price".
export function precioDesdeTexto(texto: string): number | undefined {
    const valor = Number(texto)
    return texto.trim() === "" || !Number.isFinite(valor) || valor <= 0 ? undefined : valor
}
