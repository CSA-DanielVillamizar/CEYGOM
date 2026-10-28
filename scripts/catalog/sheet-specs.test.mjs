import { describe, expect, it } from "vitest";
import { parseSheet } from "./sheet-specs.mjs";

const sheet = `
                  CANALETA METALICA
Referencia  Descripción             Ancho(A)  Alto(H)  Longitud(L)       Calibre
CN0101      Canaleta 4*2            40        20       2400              22
CN0801      Canaleta 10*5           100       50       2400              22
CN0901      Canaleta 10*5 presión   110       50       2400              22
Nota: Medidas en milímetros, los dos últimos números del código determinan el color.
Código  Color
01      Blanco
10      Ral
Material:
Nuestros producto está fabricado a partir de laminas de acero frio (cold-rolled)
calibres 20 y 18

Acabado:
Se presentan en dos tipos: galvanizado y pintura electroestática en polvo.
`;

describe("parseSheet", () => {
  it("reads material, finishes and colors as the sheet states them", () => {
    const r = parseSheet(sheet);
    expect(r.material).toBe("Láminas de acero frío (cold-rolled) calibres 20 y 18");
    expect(r.finishes).toEqual(["galvanizado", "pintura-electrostatica"]);
    expect(r.colors).toEqual([{ code: "01", name: "Blanco" }, { code: "10", name: "Ral" }]);
  });

  it("reads one value per column, keeping descriptions like 5*5 out of the numbers", () => {
    const { specs } = parseSheet(sheet);
    expect(specs.columns).toEqual(["Ancho (A) (mm)", "Alto (H) (mm)", "Longitud (L) (mm)", "Calibre"]);
    expect(specs.rows).toEqual({ CN0101: ["40", "20", "2400", "22"], CN0801: ["100", "50", "2400", "22"], CN0901: ["110", "50", "2400", "22"] });
  });

  it("handles a capacity with its unit, glued or spaced", () => {
    const { specs } = parseSheet(`Referencia  Descripción  Altura total  Ancho  Capacidad de carga
BP0101  Bandeja 5*5  55  50  74 Kg/m
BP1201  Bandeja30*8 reforzada  85  300  149Kg/m
Nota: medidas en milímetros`);
    expect(specs.rows).toEqual({ BP0101: ["55", "50", "74"], BP1201: ["85", "300", "149"] });
  });

  it("drops rows that do not line up with the header instead of guessing", () => {
    const { specs } = parseSheet(`Referencia  Descripción  Altura  Ancho  Fondo
RA1301  Rack de piso 120cm  1200  610
RA1401  Rack de piso 150cm  1500  610  700
Nota: las dimensiones son en milímetros`);
    expect(specs.rows).toEqual({ RA1401: ["1500", "610", "700"] });
  });

  it("returns no table when the header names no columns, and nothing invented when the text is empty", () => {
    expect(parseSheet("Referencia Descripción | 100 | 100 | 20\nCN0101 Cruz 100 100 20").specs).toBeUndefined();
    expect(parseSheet("")).toEqual({ finishes: [], colors: [] });
  });
});
