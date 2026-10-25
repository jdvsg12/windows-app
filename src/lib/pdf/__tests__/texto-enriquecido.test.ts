import { describe, expect, it } from "vitest"

import { parsearTextoEnriquecido } from "@/lib/pdf/texto-enriquecido"
import type { TramoTexto } from "@/lib/types"

const normal = (texto: string): TramoTexto => ({ texto, negrita: false, cursiva: false })
const negrita = (texto: string): TramoTexto => ({ texto, negrita: true, cursiva: false })
const cursiva = (texto: string): TramoTexto => ({ texto, negrita: false, cursiva: true })

// Capturado del editor en Chromium (Playwright): texto con formato, centrado, viñetas,
// numerada, derecha y un Shift+Enter, que con white-space: pre-wrap queda como "\n".
const DEL_EDITOR =
    'Primera linea <b>negrita</b> y <i>cursiva</i><div style="text-align: center;">Centrado</div>' +
    '<div style="text-align: left;"><ul><li>uno</li><li>dos</li></ul><div><ol><li>paso 1</li><li>paso 2</li></ol>' +
    '<div style="text-align: right;">A la derecha\nsalto suave &amp; &lt;80-25&gt;</div></div></div>'

describe("texto enriquecido del editor para el PDF", () => {
    it("interpreta todo lo que produce el editor", () => {
        expect(parsearTextoEnriquecido(DEL_EDITOR)).toEqual([
            {
                tipo: "parrafo",
                alineacion: "left",
                tramos: [normal("Primera linea "), negrita("negrita"), normal(" y "), cursiva("cursiva")],
            },
            { tipo: "parrafo", alineacion: "center", tramos: [normal("Centrado")] },
            {
                tipo: "lista",
                ordenada: false,
                items: [
                    { tramos: [normal("uno")], nivel: 0 },
                    { tramos: [normal("dos")], nivel: 0 },
                ],
            },
            {
                tipo: "lista",
                ordenada: true,
                items: [
                    { tramos: [normal("paso 1")], nivel: 0 },
                    { tramos: [normal("paso 2")], nivel: 0 },
                ],
            },
            { tipo: "parrafo", alineacion: "right", tramos: [normal("A la derecha\nsalto suave & <80-25>")] },
        ])
    })

    it("negrita y cursiva juntas", () => {
        expect(parsearTextoEnriquecido("<b><i>ambas</i></b>")).toEqual([
            { tipo: "parrafo", alineacion: "left", tramos: [{ texto: "ambas", negrita: true, cursiva: true }] },
        ])
    })

    it("<br> parte el párrafo y una línea vacía se conserva", () => {
        expect(parsearTextoEnriquecido("<div>uno<br></div><div><br></div><div>dos</div>")).toEqual([
            { tipo: "parrafo", alineacion: "left", tramos: [normal("uno")] },
            { tipo: "parrafo", alineacion: "left", tramos: [] },
            { tipo: "parrafo", alineacion: "left", tramos: [normal("dos")] },
        ])
    })

    it("quita las líneas vacías del principio y del final", () => {
        expect(parsearTextoEnriquecido("<div><br></div>Hola<div><br></div><div><br></div>")).toEqual([
            { tipo: "parrafo", alineacion: "left", tramos: [normal("Hola")] },
        ])
    })

    it("vacío o solo espacios no da bloques", () => {
        expect(parsearTextoEnriquecido("")).toEqual([])
        expect(parsearTextoEnriquecido("<div><br></div>  ")).toEqual([])
    })

    it("texto pegado: <p>, <strong>, <em> y <span> con estilo", () => {
        const pegado =
            '<p align="center"><strong>Título</strong></p>\n<p>Con <em>énfasis</em> y ' +
            '<span style="font-weight: 700">peso</span> o <span style="font-style:italic">estilo</span>.</p>'
        expect(parsearTextoEnriquecido(pegado)).toEqual([
            { tipo: "parrafo", alineacion: "center", tramos: [negrita("Título")] },
            {
                tipo: "parrafo",
                alineacion: "left",
                tramos: [normal("Con "), cursiva("énfasis"), normal(" y "), negrita("peso"), normal(" o "), cursiva("estilo"), normal(".")],
            },
        ])
    })

    it("descarta etiquetas desconocidas, estilos, scripts y comentarios, pero no su texto", () => {
        const pegado = "<style>p{color:red}</style><!-- comentario --><u>subrayado</u> <a href='#'>enlace</a><script>alert(1)</script>"
        expect(parsearTextoEnriquecido(pegado)).toEqual([
            { tipo: "parrafo", alineacion: "left", tramos: [normal("subrayado enlace")] },
        ])
    })

    it("listas anidadas quedan con su nivel; un <div> dentro de un ítem no lo parte", () => {
        const html = "<ul>\n  <li><div>Vidrio</div><ul><li>Incoloro</li></ul>templado</li>\n  <li>Aluminio</li>\n</ul>"
        expect(parsearTextoEnriquecido(html)).toEqual([
            {
                tipo: "lista",
                ordenada: false,
                items: [
                    { tramos: [normal("Vidrio")], nivel: 0 },
                    { tramos: [normal("Incoloro")], nivel: 1 },
                    { tramos: [normal("templado")], nivel: 0 },
                    { tramos: [normal("Aluminio")], nivel: 0 },
                ],
            },
        ])
    })

    it("decodifica entidades con nombre y numéricas", () => {
        expect(parsearTextoEnriquecido("Puerta&nbsp;&amp; ventana &#241; &#xE1; &quot;80-25&quot;")).toEqual([
            { tipo: "parrafo", alineacion: "left", tramos: [normal('Puerta & ventana ñ á "80-25"')] },
        ])
    })

    it("un < suelto y etiquetas sin cerrar no rompen el texto", () => {
        expect(parsearTextoEnriquecido("<b>a < b")).toEqual([
            { tipo: "parrafo", alineacion: "left", tramos: [negrita("a < b")] },
        ])
    })

    describe("imágenes pegadas", () => {
        const PNG = "data:image/png;base64,iVBORw0KGgo="
        const JPEG = "data:image/jpeg;base64,/9j/4AAQ"

        it("una imagen corta el párrafo y conserva su alineación y medidas", () => {
            const html = `Ventana tipo <img src="${PNG}" width="600" height="400" alt="ref">sala<div style="text-align: center;"><img src='${JPEG}'></div>`
            expect(parsearTextoEnriquecido(html)).toEqual([
                { tipo: "parrafo", alineacion: "left", tramos: [normal("Ventana tipo")] },
                { tipo: "imagen", alineacion: "left", src: PNG, ancho: 600, alto: 400 },
                { tipo: "parrafo", alineacion: "left", tramos: [normal("sala")] },
                { tipo: "imagen", alineacion: "center", src: JPEG, ancho: undefined, alto: undefined },
            ])
        })

        it("una descripción con solo una imagen tiene contenido", () => {
            expect(parsearTextoEnriquecido(`<div><br></div><img src="${PNG}"><div><br></div>`)).toEqual([
                { tipo: "imagen", alineacion: "left", src: PNG, ancho: undefined, alto: undefined },
            ])
        })

        it("descarta imágenes externas o en formatos que el PDF no dibuja", () => {
            const html = '<img src="https://ejemplo.com/ventana.png"><img src="data:image/webp;base64,UklGR"><img src="data:image/svg+xml;base64,PHN2Zz4=">Texto'
            expect(parsearTextoEnriquecido(html)).toEqual([{ tipo: "parrafo", alineacion: "left", tramos: [normal("Texto")] }])
        })

        it("una imagen dentro de una lista sale después de la lista", () => {
            const html = `<ul><li>Uno<img src="${PNG}"></li><li>Dos</li></ul>Fin`
            expect(parsearTextoEnriquecido(html)).toEqual([
                { tipo: "lista", ordenada: false, items: [{ tramos: [normal("Uno")], nivel: 0 }, { tramos: [normal("Dos")], nivel: 0 }] },
                { tipo: "imagen", alineacion: "left", src: PNG, ancho: undefined, alto: undefined },
                { tipo: "parrafo", alineacion: "left", tramos: [normal("Fin")] },
            ])
        })
    })
})
