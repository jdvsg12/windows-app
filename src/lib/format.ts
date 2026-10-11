// Shared number/date formatting so cotizador, calculadora and the PDF read the same way.

const formatNumber = (value: number | undefined, decimals: number): string =>
    (value ?? 0).toLocaleString("es-CO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export const formatCurrency = (value: number | undefined): string =>
    `$${(value ?? 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`

export const formatArea = (value: number | undefined, decimals = 2): string => `${formatNumber(value, decimals)} m²`

export const formatMm = (value: number | undefined): string => `${formatNumber(value, 0)} mm`

export const formatMeters = (value: number | undefined, decimals = 2): string => `${formatNumber(value, decimals)} m`

export const formatCount = (value: number | undefined, decimals = 1): string => formatNumber(value, decimals)

export const formatDate = (date: Date | string): string => new Date(date).toLocaleDateString("es-CO")
