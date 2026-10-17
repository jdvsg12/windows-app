const ENTIDADES: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
}

// Provisional hasta AWA-34 (formato del editor en el PDF): conserva los párrafos y las listas como líneas.
export function textoPlanoDesdeHtml(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<li[^>]*>/gi, "• ")
        .replace(/<\/(p|div|li|ul|ol|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entidad) => ENTIDADES[entidad])
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}
