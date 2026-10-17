import { describe, expect, it } from "vitest"

import { textoPlanoDesdeHtml } from "@/lib/pdf/texto"

describe("texto plano desde el HTML del editor", () => {
    it("quita el formato y conserva el texto", () => {
        expect(textoPlanoDesdeHtml("<b>Suministro</b> e <i>instalación</i>")).toBe("Suministro e instalación")
    })

    it("cada párrafo y salto de línea queda en su propia línea", () => {
        expect(textoPlanoDesdeHtml("<div>Primero</div><div>Segundo<br>Tercero</div>")).toBe("Primero\nSegundo\nTercero")
    })

    it("las listas quedan con viñetas", () => {
        expect(textoPlanoDesdeHtml("<ul><li>Vidrio</li><li>Aluminio</li></ul>")).toBe("• Vidrio\n• Aluminio")
    })

    it("decodifica las entidades que escribe el navegador", () => {
        expect(textoPlanoDesdeHtml("Puerta&nbsp;&amp;&nbsp;ventana &lt;80-25&gt;")).toBe("Puerta & ventana <80-25>")
    })

    it("vacío queda vacío", () => {
        expect(textoPlanoDesdeHtml("<div><br></div>")).toBe("")
    })
})
