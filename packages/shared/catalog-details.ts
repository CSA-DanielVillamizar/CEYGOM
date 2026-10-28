// Output of scripts/catalog/import-catalog.mjs (source: scripts/catalog/manifest.json). Do not edit by hand.
// Product pages only: references read from the data sheets, photos and pending items. Keep it out of the wizard.

export interface ProductImage {
  /** File name (no extension) in src/assets/productos. */
  file: string;
  /** True when the photo does not show this exact product. */
  illustrative: boolean;
  /** True when the assignment of the photo still has to be confirmed with the company. */
  confirm: boolean;
}

export interface ProductDetail {
  ficha: { path: string; code: string | null; sizeKb: number } | null;
  references: { code: string; text: string }[];
  images: ProductImage[];
  pending: string[];
}

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  "bandeja-porta-cables": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-porta-cables.pdf",
      "code": "FT-MYV-01",
      "sizeKb": 81
    },
    "references": [
      {
        "code": "BP0101",
        "text": "Bandeja porta cables 5*5"
      },
      {
        "code": "BP0201",
        "text": "Bandeja porta cables 10*5"
      },
      {
        "code": "BP0301",
        "text": "Bandeja porta cables 15*5"
      },
      {
        "code": "BP0401",
        "text": "Bandeja porta cables 20*5"
      },
      {
        "code": "BP0501",
        "text": "Bandeja porta cables 30*5"
      },
      {
        "code": "BP0601",
        "text": "Bandeja porta cables 10*8"
      },
      {
        "code": "BP0701",
        "text": "Bandeja porta cables 20*8"
      },
      {
        "code": "BP0801",
        "text": "Bandeja porta cables 30*8"
      },
      {
        "code": "BP0901",
        "text": "Bandeja porta cables 40*8"
      },
      {
        "code": "BP1001",
        "text": "Bandeja porta cables 10*8 reforzada"
      },
      {
        "code": "BP1101",
        "text": "Bandeja porta cables 20*8 reforzada"
      },
      {
        "code": "BP1201",
        "text": "Bandeja porta cables 30*8 reforzada"
      },
      {
        "code": "BP1301",
        "text": "Bandeja porta cables 40*8 reforzada"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-cruz": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-cruz.pdf",
      "code": "FT-MYV-02",
      "sizeKb": 63
    },
    "references": [
      {
        "code": "AB5301",
        "text": "Cruz 5*5"
      },
      {
        "code": "AB5401",
        "text": "Cruz 10*5"
      },
      {
        "code": "AB5501",
        "text": "Cruz 15*5"
      },
      {
        "code": "AB5601",
        "text": "Cruz 20*5"
      },
      {
        "code": "AB5701",
        "text": "Cruz 30*5"
      },
      {
        "code": "AB5801",
        "text": "Cruz 10*8"
      },
      {
        "code": "AB5901",
        "text": "Cruz 20*8"
      },
      {
        "code": "AB6001",
        "text": "Cruz 30*8"
      },
      {
        "code": "AB6101",
        "text": "Cruz 40*8"
      },
      {
        "code": "AB6201",
        "text": "Cruz 10*8 reforzada"
      },
      {
        "code": "AB6301",
        "text": "Cruz 20*8 reforzada"
      },
      {
        "code": "AB6401",
        "text": "Cruz 30*8 reforzada"
      },
      {
        "code": "AB6501",
        "text": "Cruz 40*8 reforzada"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-curva-horizontal-45": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-curva-horizontal-45.pdf",
      "code": "FT-MYV-03",
      "sizeKb": 63
    },
    "references": [],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Tabla de referencias (la ficha no se puede leer como texto; consultar el PDF)",
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-curva-horizontal-90": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-curva-horizontal-90.pdf",
      "code": "FT-MYV-04",
      "sizeKb": 62
    },
    "references": [
      {
        "code": "AB2701",
        "text": "Curva horizontal 90º 5*5"
      },
      {
        "code": "AB2801",
        "text": "Curva horizontal 90º 10*5"
      },
      {
        "code": "AB2901",
        "text": "Curva horizontal 90º 15*5"
      },
      {
        "code": "AB3001",
        "text": "Curva horizontal 90º 20*5"
      },
      {
        "code": "AB3101",
        "text": "Curva horizontal 90º 30*5"
      },
      {
        "code": "AB3201",
        "text": "Curva horizontal 90º 10*8"
      },
      {
        "code": "AB3301",
        "text": "Curva horizontal 90º 20*8"
      },
      {
        "code": "AB3401",
        "text": "Curva horizontal 90º 30*8"
      },
      {
        "code": "AB3501",
        "text": "Curva horizontal 90º 40*8"
      },
      {
        "code": "AB3601",
        "text": "Curva horizontal 90º 10*8 reforzada"
      },
      {
        "code": "AB3701",
        "text": "Curva horizontal 90º 20*8 reforzada"
      },
      {
        "code": "AB3801",
        "text": "Curva horizontal 90º 30*8 reforzada"
      },
      {
        "code": "AB3901",
        "text": "Curva horizontal 90º 40*8 reforzada"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-curva-vertical-exterior": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-curva-vertical-exterior.pdf",
      "code": "FT-MYV-05",
      "sizeKb": 63
    },
    "references": [
      {
        "code": "AB5301",
        "text": "Curva vertical exterior 5*5"
      },
      {
        "code": "AB5401",
        "text": "Curva vertical exterior 10*5"
      },
      {
        "code": "AB5501",
        "text": "Curva vertical exterior 15*5"
      },
      {
        "code": "AB5601",
        "text": "Curva vertical exterior 20*5"
      },
      {
        "code": "AB5701",
        "text": "Curva vertical exterior 30*5"
      },
      {
        "code": "AB5801",
        "text": "Curva vertical exterior 10*8"
      },
      {
        "code": "AB5901",
        "text": "Curva vertical exterior 20*8"
      },
      {
        "code": "AB6001",
        "text": "Curva vertical exterior 30*8"
      },
      {
        "code": "AB6101",
        "text": "Curva vertical exterior 40*8"
      },
      {
        "code": "AB6201",
        "text": "Curva vertical exterior 10*8 reforzada"
      },
      {
        "code": "AB6301",
        "text": "Curva vertical exterior 20*8 reforzada"
      },
      {
        "code": "AB6401",
        "text": "Curva vertical exterior 30*8 reforzada"
      },
      {
        "code": "AB6501",
        "text": "Curva vertical exterior 40*8 reforzada"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-curva-vertical-interior": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-curva-vertical-interior.pdf",
      "code": "FT-MYV-06",
      "sizeKb": 63
    },
    "references": [
      {
        "code": "AB5301",
        "text": "Curva vertical interior 5*5"
      },
      {
        "code": "AB5401",
        "text": "Curva vertical interior 10*5"
      },
      {
        "code": "AB5501",
        "text": "Curva vertical interior 15*5"
      },
      {
        "code": "AB5601",
        "text": "Curva vertical interior 20*5"
      },
      {
        "code": "AB5701",
        "text": "Curva vertical interior 30*5"
      },
      {
        "code": "AB5801",
        "text": "Curva vertical interior 10*8"
      },
      {
        "code": "AB5901",
        "text": "Curva vertical interior 20*8"
      },
      {
        "code": "AB6001",
        "text": "Curva vertical interior 30*8"
      },
      {
        "code": "AB6101",
        "text": "Curva vertical interior 40*8"
      },
      {
        "code": "AB6201",
        "text": "Curva vertical interior 10*8 reforzada"
      },
      {
        "code": "AB6301",
        "text": "Curva vertical interior 20*8 reforzada"
      },
      {
        "code": "AB6401",
        "text": "Curva vertical interior 30*8 reforzada"
      },
      {
        "code": "AB6501",
        "text": "Curva vertical interior 40*8 reforzada"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-reduccion-asimetrica": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-reduccion-asimetrica.pdf",
      "code": "FT-MYV-07",
      "sizeKb": 65
    },
    "references": [],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Tabla de referencias (la ficha no se puede leer como texto; consultar el PDF)",
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-reduccion-simetrica": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-reduccion-simetrica.pdf",
      "code": "FT-MYV-08",
      "sizeKb": 65
    },
    "references": [],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Tabla de referencias (la ficha no se puede leer como texto; consultar el PDF)",
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-te": {
    "ficha": {
      "path": "/fichas/bandejas-portacables/bandeja-te.pdf",
      "code": "FT-MYV-09",
      "sizeKb": 64
    },
    "references": [
      {
        "code": "AB4001",
        "text": "Te 5*5"
      },
      {
        "code": "AB4101",
        "text": "Te 10*5"
      },
      {
        "code": "AB4201",
        "text": "Te 15*5"
      },
      {
        "code": "AB4301",
        "text": "Te 20*5"
      },
      {
        "code": "AB4401",
        "text": "Te 30*5"
      },
      {
        "code": "AB4501",
        "text": "Te 10*8"
      },
      {
        "code": "AB4601",
        "text": "Te 20*8"
      },
      {
        "code": "AB4701",
        "text": "Te 30*8"
      },
      {
        "code": "AB4801",
        "text": "Te 40*8"
      },
      {
        "code": "AB4901",
        "text": "Te 10*8 reforzada"
      },
      {
        "code": "AB5001",
        "text": "Te 20*8 reforzada"
      },
      {
        "code": "AB5101",
        "text": "Te 30*8 reforzada"
      },
      {
        "code": "AB5201",
        "text": "Te 40*8 reforzada"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta.pdf",
      "code": "FT-MYV-11",
      "sizeKb": 54
    },
    "references": [
      {
        "code": "CN0101",
        "text": "Canaleta 4*2"
      },
      {
        "code": "CN0201",
        "text": "Canaleta 4*4"
      },
      {
        "code": "CN0301",
        "text": "Canaleta 6*4"
      },
      {
        "code": "CN0401",
        "text": "Canaleta 8*4"
      },
      {
        "code": "CN0501",
        "text": "Canaleta 8*4 presión"
      },
      {
        "code": "CN0601",
        "text": "Canaleta 10*4"
      },
      {
        "code": "CN0701",
        "text": "Canaleta 10*4 presión"
      },
      {
        "code": "CN0801",
        "text": "Canaleta 10*5"
      },
      {
        "code": "CN0901",
        "text": "Canaleta 10*5 presión"
      },
      {
        "code": "CN1001",
        "text": "Canaleta 11*4"
      },
      {
        "code": "CN1101",
        "text": "Canaleta 11*4 presión"
      },
      {
        "code": "CN1201",
        "text": "Canaleta 11*5"
      },
      {
        "code": "CN1301",
        "text": "Canaleta 11*5 presión"
      },
      {
        "code": "CN1401",
        "text": "Canaleta 12*4"
      },
      {
        "code": "CN1501",
        "text": "Canaleta 12*4 presión"
      },
      {
        "code": "CN1601",
        "text": "Canaleta 12*5"
      },
      {
        "code": "CN1701",
        "text": "Canaleta 12*5 presión"
      },
      {
        "code": "CN1801",
        "text": "Canaleta 10*8"
      },
      {
        "code": "CN1901",
        "text": "Canaleta 10*10"
      },
      {
        "code": "CN2001",
        "text": "Canaleta 20*8"
      },
      {
        "code": "CN2101",
        "text": "Canaleta 20*10"
      },
      {
        "code": "CN2201",
        "text": "Canaleta 30*8"
      },
      {
        "code": "CN2301",
        "text": "Canaleta 30*10"
      },
      {
        "code": "CN2401",
        "text": "Canaleta 24*8 tipo bic"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "canaleta-metalica2",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-curva-horizontal-exterior": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-curva-horizontal-exterior.pdf",
      "code": "FT-MYV-12",
      "sizeKb": 51
    },
    "references": [
      {
        "code": "AN4301",
        "text": "Curva horizontal exterior 8*4"
      },
      {
        "code": "AN4401",
        "text": "Curva horizontal exterior 8*4 presión"
      },
      {
        "code": "AN4501",
        "text": "Curva horizontal exterior 10*4"
      },
      {
        "code": "AN4601",
        "text": "Curva horizontal exterior 10*4 presión"
      },
      {
        "code": "AN4701",
        "text": "Curva horizontal exterior 10*5"
      },
      {
        "code": "AN4801",
        "text": "Curva horizontal exterior 10*5 presión"
      },
      {
        "code": "AN4901",
        "text": "Curva horizontal exterior 11*4"
      },
      {
        "code": "AN5001",
        "text": "Curva horizontal exterior 11*4 presión"
      },
      {
        "code": "AN5101",
        "text": "Curva horizontal exterior 11*5"
      },
      {
        "code": "AN5201",
        "text": "Curva horizontal exterior 11*5 presión"
      },
      {
        "code": "AN5301",
        "text": "Curva horizontal exterior 12*4"
      },
      {
        "code": "AN5401",
        "text": "Curva horizontal exterior 12*4 presión"
      },
      {
        "code": "AN5501",
        "text": "Curva horizontal exterior 12*5"
      },
      {
        "code": "AN5601",
        "text": "Curva horizontal exterior 12*5 presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-curva-horizontal-interior": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-curva-horizontal-interior.pdf",
      "code": "FT-MYV-13",
      "sizeKb": 52
    },
    "references": [
      {
        "code": "AN2201",
        "text": "Curva horizontal interior 8*4"
      },
      {
        "code": "AN2301",
        "text": "Curva horizontal interior 8*4 presión"
      },
      {
        "code": "AN2401",
        "text": "Curva horizontal interior 10*4"
      },
      {
        "code": "AN2501",
        "text": "Curva horizontal interior 10*4 presión"
      },
      {
        "code": "AN2601",
        "text": "Curva horizontal interior 10*5"
      },
      {
        "code": "AN2701",
        "text": "Curva horizontal interior 10*5 presión"
      },
      {
        "code": "AN2801",
        "text": "Curva horizontal interior 11*4"
      },
      {
        "code": "AN2901",
        "text": "Curva horizontal interior 11*4 presión"
      },
      {
        "code": "AN3001",
        "text": "Curva horizontal interior 11*5"
      },
      {
        "code": "AN3101",
        "text": "Curva horizontal interior 11*5 presión"
      },
      {
        "code": "AN3201",
        "text": "Curva horizontal interior 12*4"
      },
      {
        "code": "AN3301",
        "text": "Curva horizontal interior 12*4 presión"
      },
      {
        "code": "AN3401",
        "text": "Curva horizontal interior 12*5"
      },
      {
        "code": "AN3501",
        "text": "Curva horizontal interior 12*5 presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-cruz-ductos": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-cruz-ductos.pdf",
      "code": "FT-MYV-14",
      "sizeKb": 50
    },
    "references": [],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Tabla de referencias (la ficha no se puede leer como texto; consultar el PDF)",
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-curva-vertical": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-curva-vertical.pdf",
      "code": "FT-MYV-15",
      "sizeKb": 51
    },
    "references": [
      {
        "code": "AN0101",
        "text": "Curva vertical 8*4"
      },
      {
        "code": "AN0201",
        "text": "Curva vertical 8*4 presión"
      },
      {
        "code": "AN0301",
        "text": "Curva vertical 10*4"
      },
      {
        "code": "AN0401",
        "text": "Curva vertical 10*4 presión"
      },
      {
        "code": "AN0501",
        "text": "Curva vertical 10*5"
      },
      {
        "code": "AN0601",
        "text": "Curva vertical 10*5 presión"
      },
      {
        "code": "AN0701",
        "text": "Curva vertical 11*4"
      },
      {
        "code": "AN0801",
        "text": "Curva vertical 11*4 presión"
      },
      {
        "code": "AN0901",
        "text": "Curva vertical 11*5"
      },
      {
        "code": "AN1001",
        "text": "Curva vertical 11*5 presión"
      },
      {
        "code": "AN1101",
        "text": "Curva vertical 12*4"
      },
      {
        "code": "AN1201",
        "text": "Curva vertical 12*4 presión"
      },
      {
        "code": "AN1301",
        "text": "Curva vertical 12*5"
      },
      {
        "code": "AN1401",
        "text": "Curva vertical 12*5 presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-curva-horizontal": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-curva-horizontal.pdf",
      "code": "FT-MYV-16",
      "sizeKb": 50
    },
    "references": [
      {
        "code": "AN1501",
        "text": "Curva horizontal 10*8"
      },
      {
        "code": "AN1601",
        "text": "Curva horizontal 10*10"
      },
      {
        "code": "AN1701",
        "text": "Curva horizontal 20*8"
      },
      {
        "code": "AN1801",
        "text": "Curva horizontal 20*10"
      },
      {
        "code": "AN1901",
        "text": "Curva horizontal 30*8"
      },
      {
        "code": "AN2001",
        "text": "Curva horizontal 30*10"
      },
      {
        "code": "AN2101",
        "text": "Curva horizontal 24*8 tipo bic"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-curva-vertical-exterior": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-curva-vertical-exterior.pdf",
      "code": "FT-MYV-17",
      "sizeKb": 51
    },
    "references": [
      {
        "code": "AN5701",
        "text": "Curva vertical exterior 10*8"
      },
      {
        "code": "AN5801",
        "text": "Curva vertical exterior 10*10"
      },
      {
        "code": "AN5901",
        "text": "Curva vertical exterior 20*8"
      },
      {
        "code": "AN6001",
        "text": "Curva vertical exterior 20*10"
      },
      {
        "code": "AN6101",
        "text": "Curva vertical exterior 30*8"
      },
      {
        "code": "AN6201",
        "text": "Curva vertical exterior 30*10"
      },
      {
        "code": "AN6301",
        "text": "Curva vertical exterior 24*8 tipo bic"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-curva-vertical-interior": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-curva-vertical-interior.pdf",
      "code": "FT-MYV-18",
      "sizeKb": 51
    },
    "references": [
      {
        "code": "AN3601",
        "text": "Curva vertical interior 10*8"
      },
      {
        "code": "AN3701",
        "text": "Curva vertical interior 10*10"
      },
      {
        "code": "AN3801",
        "text": "Curva vertical interior 20*8"
      },
      {
        "code": "AN3901",
        "text": "Curva vertical interior 20*10"
      },
      {
        "code": "AN4001",
        "text": "Curva vertical interior 30*8"
      },
      {
        "code": "AN4101",
        "text": "Curva vertical interior 30*10"
      },
      {
        "code": "AN4201",
        "text": "Curva vertical interior 24*8 tipo bic"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-tapas-dobles-realzadas": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-tapas-dobles-realzadas.pdf",
      "code": "FT-MYV-20",
      "sizeKb": 153
    },
    "references": [
      {
        "code": "TS3301",
        "text": "Troquel realzado doble levitón y datos 8 cm"
      },
      {
        "code": "TS3401",
        "text": "Troquel realzado doble levitón y datos 10 cm"
      },
      {
        "code": "TS3501",
        "text": "Troquel realzado doble levitón y datos 11 cm"
      },
      {
        "code": "TS3601",
        "text": "Troquel realzado doble levitón y datos 12 cm"
      },
      {
        "code": "TS3701",
        "text": "Troquel realzado doble levitón 8 cm"
      },
      {
        "code": "TS3801",
        "text": "Troquel realzado doble levitón 10 cm"
      },
      {
        "code": "TS3901",
        "text": "Troquel realzado doble levitón 11 cm"
      },
      {
        "code": "TS4001",
        "text": "Troquel realzado doble levitón 12 cm"
      },
      {
        "code": "TS4101",
        "text": "Troquel realzado doble datos 8 cm"
      },
      {
        "code": "TS4201",
        "text": "Troquel realzado doble datos 10 cm"
      },
      {
        "code": "TS4301",
        "text": "Troquel realzado doble datos 11 cm"
      },
      {
        "code": "TS4401",
        "text": "Troquel realzado doble datos 12 cm"
      },
      {
        "code": "TS8101",
        "text": "Troquel realzado doble levitón y datos 8 cm presión"
      },
      {
        "code": "TS8201",
        "text": "Troquel realzado doble levitón y datos 10 cm presión"
      },
      {
        "code": "TS8301",
        "text": "Troquel realzado doble levitón y datos 11 cm presión"
      },
      {
        "code": "TS8401",
        "text": "Troquel realzado doble levitón y datos 12 cm presión"
      },
      {
        "code": "TS8501",
        "text": "Troquel realzado doble levitón 8 cm presión"
      },
      {
        "code": "TS8601",
        "text": "Troquel realzado doble levitón 10 cm presión"
      },
      {
        "code": "TS8701",
        "text": "Troquel realzado doble levitón 11 cm presión"
      },
      {
        "code": "TS8801",
        "text": "Troquel realzado doble levitón 12 cm presión"
      },
      {
        "code": "TS8901",
        "text": "Troquel realzado doble datos 8 cm presión"
      },
      {
        "code": "TS9001",
        "text": "Troquel realzado doble datos 10 cm presión"
      },
      {
        "code": "TS9101",
        "text": "Troquel realzado doble datos 11 cm presión"
      },
      {
        "code": "TS9201",
        "text": "Troquel realzado doble datos 12 cm presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-tapas-dobles": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-tapas-dobles.pdf",
      "code": "FT-MYV-19",
      "sizeKb": 156
    },
    "references": [
      {
        "code": "TS0901",
        "text": "Troquel doble levitón y datos 8 cm"
      },
      {
        "code": "TS1001",
        "text": "Troquel doble levitón y datos 10 cm"
      },
      {
        "code": "TS1101",
        "text": "Troquel doble levitón y datos 11 cm"
      },
      {
        "code": "TS1201",
        "text": "Troquel doble levitón y datos 12 cm"
      },
      {
        "code": "TS1301",
        "text": "Troquel doble levitón 8 cm"
      },
      {
        "code": "TS1401",
        "text": "Troquel doble levitón 10 cm"
      },
      {
        "code": "TS1501",
        "text": "Troquel doble levitón 11 cm"
      },
      {
        "code": "TS1601",
        "text": "Troquel doble levitón 12 cm"
      },
      {
        "code": "TS1701",
        "text": "Troquel doble datos 8 cm"
      },
      {
        "code": "TS1801",
        "text": "Troquel doble datos 10 cm"
      },
      {
        "code": "TS1901",
        "text": "Troquel doble datos 11 cm"
      },
      {
        "code": "TS2001",
        "text": "Troquel doble datos 12 cm"
      },
      {
        "code": "TS5701",
        "text": "Troquel doble levitón y datos 8 cm presión"
      },
      {
        "code": "TS5801",
        "text": "Troquel doble levitón y datos 10 cm presión"
      },
      {
        "code": "TS5901",
        "text": "Troquel doble levitón y datos 11 cm presión"
      },
      {
        "code": "TS6001",
        "text": "Troquel doble levitón y datos 12 cm presión"
      },
      {
        "code": "TS6101",
        "text": "Troquel doble levitón 8 cm presión"
      },
      {
        "code": "TS6201",
        "text": "Troquel doble levitón 10 cm presión"
      },
      {
        "code": "TS6301",
        "text": "Troquel doble levitón 11 cm presión"
      },
      {
        "code": "TS6401",
        "text": "Troquel doble levitón 12 cm presión"
      },
      {
        "code": "TS6501",
        "text": "Troquel doble datos 8 cm presión"
      },
      {
        "code": "TS6601",
        "text": "Troquel doble datos 10 cm presión"
      },
      {
        "code": "TS6701",
        "text": "Troquel doble datos 11 cm presión"
      },
      {
        "code": "TS6801",
        "text": "Troquel doble datos 12 cm presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-tapas-sencillas": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-tapas-sencillas.pdf",
      "code": "FT-MYV-21",
      "sizeKb": 251
    },
    "references": [
      {
        "code": "TS0101",
        "text": "Troquel sencillo levitón 8 cm"
      },
      {
        "code": "TS0201",
        "text": "Troquel sencillo levitón 10 cm"
      },
      {
        "code": "TS0301",
        "text": "Troquel sencillo levitón 11 cm"
      },
      {
        "code": "TS0401",
        "text": "Troquel sencillo levitón 12 cm"
      },
      {
        "code": "TS0501",
        "text": "Troquel sencillo datos 8 cm"
      },
      {
        "code": "TS0601",
        "text": "Troquel sencillo datos 10 cm"
      },
      {
        "code": "TS0701",
        "text": "Troquel sencillo datos 11 cm"
      },
      {
        "code": "TS0801",
        "text": "Troquel sencillo datos 12 cm"
      },
      {
        "code": "TS4901",
        "text": "Troquel sencillo levitón 8 cm presión"
      },
      {
        "code": "TS5001",
        "text": "Troquel sencillo levitón 10 cm presión"
      },
      {
        "code": "TS5101",
        "text": "Troquel sencillo levitón 11 cm presión"
      },
      {
        "code": "TS5201",
        "text": "Troquel sencillo levitón 12 cm presión"
      },
      {
        "code": "TS5301",
        "text": "Troquel sencillo datos 8 cm presión"
      },
      {
        "code": "TS5401",
        "text": "Troquel sencillo datos 10 cm presión"
      },
      {
        "code": "TS5501",
        "text": "Troquel sencillo datos 11 cm presión"
      },
      {
        "code": "TS5601",
        "text": "Troquel sencillo datos 12 cm presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-tapas-sencillas-realzadas": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-tapas-sencillas-realzadas.pdf",
      "code": "FT-MYV-22",
      "sizeKb": 331
    },
    "references": [
      {
        "code": "TS2501",
        "text": "Troquel realzado sencillo levitón 8 cm"
      },
      {
        "code": "TS2601",
        "text": "Troquel realzado sencillo levitón 10 cm"
      },
      {
        "code": "TS2701",
        "text": "Troquel realzado sencillo levitón 11 cm"
      },
      {
        "code": "TS2801",
        "text": "Troquel realzado sencillo levitón 12 cm"
      },
      {
        "code": "TS2901",
        "text": "Troquel realzado sencillo datos 8 cm"
      },
      {
        "code": "TS3001",
        "text": "Troquel realzado sencillo datos 10 cm"
      },
      {
        "code": "TS3101",
        "text": "Troquel realzado sencillo datos 11 cm"
      },
      {
        "code": "TS3201",
        "text": "Troquel realzado sencillo datos 12 cm"
      },
      {
        "code": "TS7301",
        "text": "Troquel realzado sencillo levitón 8 cm presión"
      },
      {
        "code": "TS7401",
        "text": "Troquel realzado sencillo levitón 10 cm presión"
      },
      {
        "code": "TS7501",
        "text": "Troquel realzado sencillo levitón 11 cm presión"
      },
      {
        "code": "TS7601",
        "text": "Troquel realzado sencillo levitón 12 cm presión"
      },
      {
        "code": "TS7701",
        "text": "Troquel realzado sencillo datos 8 cm presión"
      },
      {
        "code": "TS7801",
        "text": "Troquel realzado sencillo datos 10 cm presión"
      },
      {
        "code": "TS7901",
        "text": "Troquel realzado sencillo datos 11 cm presión"
      },
      {
        "code": "TS8001",
        "text": "Troquel realzado sencillo datos 12 cm presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-tapas-triples-realzadas": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-tapas-triples-realzadas.pdf",
      "code": "FT-MYV-24",
      "sizeKb": 354
    },
    "references": [
      {
        "code": "TS4501",
        "text": "Troquel realzadas triple 8 cm"
      },
      {
        "code": "TS4601",
        "text": "Troquel realzadas triple 10 cm"
      },
      {
        "code": "TS4701",
        "text": "Troquel realzadas triple 11 cm"
      },
      {
        "code": "TS4801",
        "text": "Troquel realzadas triple 12 cm"
      },
      {
        "code": "TS9301",
        "text": "Troquel realzadas triple 8 cm presión"
      },
      {
        "code": "TS9401",
        "text": "Troquel realzadas triple 10 cm presión"
      },
      {
        "code": "TS9501",
        "text": "Troquel realzadas triple 11 cm presión"
      },
      {
        "code": "TS9601",
        "text": "Troquel realzadas triple 12 cm presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-tapas-triples": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-tapas-triples.pdf",
      "code": "FT-MYV-23",
      "sizeKb": 314
    },
    "references": [
      {
        "code": "TS2101",
        "text": "Troquel triple 8 cm"
      },
      {
        "code": "TS2201",
        "text": "Troquel triple 10 cm"
      },
      {
        "code": "TS2301",
        "text": "Troquel triple 11 cm"
      },
      {
        "code": "TS2401",
        "text": "Troquel triple 12 cm"
      },
      {
        "code": "TS6901",
        "text": "Troquel triple 8 cm presión"
      },
      {
        "code": "TS7001",
        "text": "Troquel triple 10 cm presión"
      },
      {
        "code": "TS7101",
        "text": "Troquel triple 11 cm presión"
      },
      {
        "code": "TS7201",
        "text": "Troquel triple 12 cm presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-te": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-te.pdf",
      "code": "FT-MYV-25",
      "sizeKb": 52
    },
    "references": [
      {
        "code": "AN6301",
        "text": "TE 8*4"
      },
      {
        "code": "AN6401",
        "text": "TE 8*4 presión"
      },
      {
        "code": "AN6501",
        "text": "TE 10*4"
      },
      {
        "code": "AN6601",
        "text": "TE 10*4 presión"
      },
      {
        "code": "AN6701",
        "text": "TE 10*5"
      },
      {
        "code": "AN6801",
        "text": "TE 10*5 presión"
      },
      {
        "code": "AN6901",
        "text": "TE 11*4"
      },
      {
        "code": "AN7001",
        "text": "TE 11*4 presión"
      },
      {
        "code": "AN7101",
        "text": "TE 11*5"
      },
      {
        "code": "AN7201",
        "text": "TE 11*5 presión"
      },
      {
        "code": "AN7301",
        "text": "TE 12*4"
      },
      {
        "code": "AN7401",
        "text": "TE 12*4 presión"
      },
      {
        "code": "AN7501",
        "text": "TE 12*5"
      },
      {
        "code": "AN7601",
        "text": "TE 12*5 presión"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "canaleta-te-ductos": {
    "ficha": {
      "path": "/fichas/canaletas/canaleta-te-ductos.pdf",
      "code": "FT-MYV-26",
      "sizeKb": 51
    },
    "references": [
      {
        "code": "AN7701",
        "text": "TE 10*8"
      },
      {
        "code": "AN7801",
        "text": "TE 10*10"
      },
      {
        "code": "AN7901",
        "text": "TE 20*8"
      },
      {
        "code": "AN8001",
        "text": "TE 20*10"
      },
      {
        "code": "AN8101",
        "text": "TE 30*8"
      },
      {
        "code": "AN8201",
        "text": "TE 30*10"
      },
      {
        "code": "AN8301",
        "text": "TE 24*8 tipo bic"
      }
    ],
    "images": [
      {
        "file": "canaleta-metalica2",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-19-pulgadas": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/bandeja-19-pulgadas.pdf",
      "code": "FT-MYV-27",
      "sizeKb": 150
    },
    "references": [
      {
        "code": "AC0901",
        "text": "Bandeja de 25 cm 2 parales 19”"
      },
      {
        "code": "AC1001",
        "text": "Bandeja de 30 cm 2 parales 19”"
      },
      {
        "code": "AC1101",
        "text": "Bandeja de 40 cm 2 parales 19”"
      },
      {
        "code": "AC1201",
        "text": "Bandeja de 25 cm 4 parales 19”"
      },
      {
        "code": "AC1301",
        "text": "Bandeja de 30 cm 4 parales 19”"
      },
      {
        "code": "AC1401",
        "text": "Bandeja de 40 cm 4 parales 19”"
      }
    ],
    "images": [
      {
        "file": "bandeja19pulg",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "bandeja19pulg-ranurada",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "bandeja-ranurada30cm",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "bandeja-ranurada40cm",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "multitoma-19-pulgadas": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/multitoma-19-pulgadas.pdf",
      "code": "FT-MYV-28",
      "sizeKb": 165
    },
    "references": [
      {
        "code": "AC0601",
        "text": "Multitoma 3 salidas dobles 19”"
      },
      {
        "code": "AC0701",
        "text": "Multitoma 4 salidas dobles 19”"
      },
      {
        "code": "AC0801",
        "text": "Multitoma 5 salidas dobles 19”"
      }
    ],
    "images": [
      {
        "file": "multitoma-normal",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "multitoma-5-salidas-dobles": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/multitoma-5-salidas-dobles.pdf",
      "code": "FT-MYV-49",
      "sizeKb": 244
    },
    "references": [
      {
        "code": "AC0801",
        "text": "Multitoma 5 salidas dobles 19”"
      }
    ],
    "images": [
      {
        "file": "multitoma-normal",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "multitoma-5-salidas-dobles-reguladas": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/multitoma-5-salidas-dobles-reguladas.pdf",
      "code": "FT-MYV-50",
      "sizeKb": 163
    },
    "references": [
      {
        "code": "AC0801A",
        "text": "Multitoma 5 salidas dobles 19”"
      }
    ],
    "images": [
      {
        "file": "multitoma-normal",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "multitoma-grado-hospitalario": {
    "ficha": null,
    "references": [],
    "images": [
      {
        "file": "multitoma-grado-hospitalario",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Ficha técnica",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "organizador-tipo-varilla": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/organizador-tipo-varilla.pdf",
      "code": "FT-MYV-31",
      "sizeKb": 117
    },
    "references": [
      {
        "code": "AC0201",
        "text": "Organizador trasero tipo varilla 19”"
      }
    ],
    "images": [
      {
        "file": "organizador-cable-tipo-varilla",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "rack-cerrado-abatible": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/rack-cerrado-abatible.pdf",
      "code": "FT-MYV-35",
      "sizeKb": 73
    },
    "references": [
      {
        "code": "RA0101",
        "text": "Rack cerrado abatible 25 cm"
      },
      {
        "code": "RA0301",
        "text": "Rack cerrado abatible 30 cm"
      },
      {
        "code": "RA0501",
        "text": "Rack cerrado abatible 40 cm"
      },
      {
        "code": "RA0701",
        "text": "Rack cerrado abatible 50 cm"
      },
      {
        "code": "RA0901",
        "text": "Rack cerrado abatible 60 cm"
      },
      {
        "code": "RA1101",
        "text": "Rack cerrado abatible 70 cm"
      }
    ],
    "images": [
      {
        "file": "sdc10280",
        "illustrative": false,
        "confirm": true
      }
    ],
    "pending": [
      "Confirmar que la foto corresponde al producto",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "rack-cerrado-un-cuerpo": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/rack-cerrado-un-cuerpo.pdf",
      "code": "FT-MYV-36",
      "sizeKb": 72
    },
    "references": [
      {
        "code": "RA0201",
        "text": "Rack cerrado de 1 cuerpo 25 cm"
      },
      {
        "code": "RA0401",
        "text": "Rack cerrado de 1 cuerpo 30 cm"
      },
      {
        "code": "RA0601",
        "text": "Rack cerrado de 1 cuerpo 40 cm"
      },
      {
        "code": "RA0801",
        "text": "Rack cerrado de 1 cuerpo 50 cm"
      },
      {
        "code": "RA1001",
        "text": "Rack cerrado de 1 cuerpo 60 cm"
      },
      {
        "code": "RA1201",
        "text": "Rack cerrado de 1 cuerpo 70 cm"
      }
    ],
    "images": [
      {
        "file": "rack-pared-economico",
        "illustrative": false,
        "confirm": true
      }
    ],
    "pending": [
      "Confirmar que la foto corresponde al producto",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "rack-de-piso": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/rack-de-piso.pdf",
      "code": "FT-MYV-37",
      "sizeKb": 55
    },
    "references": [
      {
        "code": "RA1301",
        "text": "Rack de piso 120cm"
      },
      {
        "code": "RA1401",
        "text": "Rack de piso 150cm"
      },
      {
        "code": "RA1501",
        "text": "Rack de piso 180cm"
      },
      {
        "code": "RA1601",
        "text": "Rack de piso 210cm"
      }
    ],
    "images": [
      {
        "file": "rack-piso-cerrado",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "sdc10276",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "rack-piso-abierto",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "sdc10271",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "rack-abierto-de-pared": {
    "ficha": null,
    "references": [],
    "images": [
      {
        "file": "sdc10271",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Ficha técnica (El enlace de la ficha en la web actual devuelve error 404.)",
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "patch-panel": {
    "ficha": {
      "path": "/fichas/racks-comunicaciones/patch-panel.pdf",
      "code": "FT-MYV-42",
      "sizeKb": 177
    },
    "references": [
      {
        "code": "AC5002",
        "text": "Patch Panels 12 pts 19”"
      },
      {
        "code": "AC5102",
        "text": "Patch Panels 16 pts 19”"
      },
      {
        "code": "AC5202",
        "text": "Patch Panels 24 pts 19”"
      },
      {
        "code": "AC5302",
        "text": "Patch Panels 32pts 19”"
      }
    ],
    "images": [
      {
        "file": "patch-panel-24-puntos",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "patch-panel-12-puntos",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "bandeja-fibra-optica": {
    "ficha": null,
    "references": [],
    "images": [
      {
        "file": "bandeja-fibra",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "bandeja-fibra-op-org-cables",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Ficha técnica",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "celda-seccionador": {
    "ficha": {
      "path": "/fichas/linea-electrica/celda-seccionador.pdf",
      "code": "FT-MYV-47",
      "sizeKb": 389
    },
    "references": [
      {
        "code": "TE2501",
        "text": "Celda para seccionador"
      }
    ],
    "images": [
      {
        "file": "gabinete-equipos-medida",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "celda-transformador": {
    "ficha": {
      "path": "/fichas/linea-electrica/celda-transformador.pdf",
      "code": "FT-MYV-48",
      "sizeKb": 226
    },
    "references": [
      {
        "code": "TE2501",
        "text": "Celda para transformadores Según especificaciones del transformador"
      }
    ],
    "images": [
      {
        "file": "gabinete-equipos-medida",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "equipo-medida-proteccion": {
    "ficha": {
      "path": "/fichas/linea-electrica/equipo-medida-proteccion.pdf",
      "code": "FT-MYV-39",
      "sizeKb": 270
    },
    "references": [
      {
        "code": "TE2501",
        "text": "Equipo de medida protección, las dimensiones son establecidas"
      }
    ],
    "images": [
      {
        "file": "gabinete-equipos-medida",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "gabinete-contadores": {
    "ficha": {
      "path": "/fichas/linea-electrica/gabinete-contadores.pdf",
      "code": "FT-MYV-38",
      "sizeKb": 131
    },
    "references": [
      {
        "code": "TE0901",
        "text": "Celda 1 medidor residencial"
      },
      {
        "code": "TE1001",
        "text": "Celda 2 medidores residenciales"
      },
      {
        "code": "TE1101",
        "text": "Celda 3 medidores residenciales"
      },
      {
        "code": "TE1201",
        "text": "Celda 4 medidores residenciales"
      },
      {
        "code": "TE1301",
        "text": "Celda 5 medidores residenciales"
      },
      {
        "code": "TE1401",
        "text": "Celda 6 medidores residenciales"
      },
      {
        "code": "TE1501",
        "text": "Celda 7 medidores residenciales"
      },
      {
        "code": "TE1601",
        "text": "Celda 8 medidores residenciales"
      },
      {
        "code": "TE1701",
        "text": "Celda 1 medidor parrilla"
      },
      {
        "code": "TE1801",
        "text": "Celda 2 medidores parrilla"
      },
      {
        "code": "TE1901",
        "text": "Celda 3 medidores parrilla"
      },
      {
        "code": "TE2001",
        "text": "Celda 4 medidores parrilla"
      },
      {
        "code": "TE2101",
        "text": "Celda 5 medidores parrilla"
      },
      {
        "code": "TE2201",
        "text": "Celda 6 medidores parrilla"
      },
      {
        "code": "TE2301",
        "text": "Celda 7 medidores parrilla"
      },
      {
        "code": "TE2401",
        "text": "Celda 8 medidores parrilla"
      },
      {
        "code": "TE2501",
        "text": "Celdas especiales"
      }
    ],
    "images": [
      {
        "file": "gabinete-8-medidores",
        "illustrative": false,
        "confirm": false
      },
      {
        "file": "sdc10279",
        "illustrative": false,
        "confirm": true
      }
    ],
    "pending": [
      "Confirmar que la foto corresponde al producto",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "ml-proteccion": {
    "ficha": {
      "path": "/fichas/linea-electrica/ml-proteccion.pdf",
      "code": "FT-MYV-47",
      "sizeKb": 273
    },
    "references": [
      {
        "code": "TE0101",
        "text": "ML de 2 circuitos"
      },
      {
        "code": "TE0201",
        "text": "ML de 4 circuitos"
      },
      {
        "code": "TE0301",
        "text": "ML de 6 circuitos"
      },
      {
        "code": "TE0401",
        "text": "ML de 8 circuitos"
      },
      {
        "code": "TE0501",
        "text": "ML de 10 circuitos"
      },
      {
        "code": "TE0601",
        "text": "ML de 12 circuitos"
      },
      {
        "code": "TE0701",
        "text": "ML de 14 circuitos"
      },
      {
        "code": "TE0801",
        "text": "ML de 16 circuitos"
      },
      {
        "code": "TE2501",
        "text": "Especiales Según las especificaciones del cliente."
      }
    ],
    "images": [
      {
        "file": "gabinete-equipos-medida",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "gabinete-de-gas": {
    "ficha": null,
    "references": [],
    "images": [
      {
        "file": "gabinete-de-gas",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Ficha técnica",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "gabinete-de-incendio": {
    "ficha": null,
    "references": [],
    "images": [
      {
        "file": "gabinete-de-incendio",
        "illustrative": false,
        "confirm": false
      }
    ],
    "pending": [
      "Ficha técnica",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "soporte-aereo": {
    "ficha": {
      "path": "/fichas/soportes/soporte-aereo.pdf",
      "code": "FT-MYV-42",
      "sizeKb": 124
    },
    "references": [
      {
        "code": "AC1501",
        "text": "Soporte aéreo 10*5"
      },
      {
        "code": "AC1601",
        "text": "Soporte aéreo 15*5"
      },
      {
        "code": "AC1701",
        "text": "Soporte aéreo 20*5"
      },
      {
        "code": "AC1801",
        "text": "Soporte aéreo 30*5"
      },
      {
        "code": "AC1901",
        "text": "Soporte aéreo 10*8"
      },
      {
        "code": "AC2001",
        "text": "Soporte aéreo 20*8"
      },
      {
        "code": "AC2101",
        "text": "Soporte aéreo 30*8"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada30cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "soporte-peldano": {
    "ficha": {
      "path": "/fichas/soportes/soporte-peldano.pdf",
      "code": "FT-MYV-43",
      "sizeKb": 145
    },
    "references": [
      {
        "code": "AC4001",
        "text": "Soporte peldaño 10 cm"
      },
      {
        "code": "AC4101",
        "text": "Soporte peldaño 20 cm"
      },
      {
        "code": "AC4201",
        "text": "Soporte peldaño 30 cm"
      },
      {
        "code": "AC4301",
        "text": "Soporte peldaño 40 cm"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada30cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "soporte-plancha": {
    "ficha": {
      "path": "/fichas/soportes/soporte-plancha.pdf",
      "code": "FT-MYV-45",
      "sizeKb": 116
    },
    "references": [
      {
        "code": "AC2201",
        "text": "Soporte plancha de 10*5"
      },
      {
        "code": "AC2301",
        "text": "Soporte plancha de 15*5"
      },
      {
        "code": "AC2401",
        "text": "Soporte plancha de 20*5"
      },
      {
        "code": "AC2501",
        "text": "Soporte plancha de 30*5"
      },
      {
        "code": "AC2601",
        "text": "Soporte plancha de 10*8"
      },
      {
        "code": "AC2701",
        "text": "Soporte plancha de 20*8"
      },
      {
        "code": "AC2801",
        "text": "Soporte plancha de 30*8"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada30cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "soporte-repisa": {
    "ficha": {
      "path": "/fichas/soportes/soporte-repisa.pdf",
      "code": "FT-MYV-44",
      "sizeKb": 119
    },
    "references": [
      {
        "code": "AC4001",
        "text": "Soporte repisa 10 cm"
      },
      {
        "code": "AC4101",
        "text": "Soporte repisa 20 cm"
      },
      {
        "code": "AC4201",
        "text": "Soporte repisa 30 cm"
      },
      {
        "code": "AC4301",
        "text": "Soporte repisa 40 cm"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada30cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  },
  "soporte-universal": {
    "ficha": {
      "path": "/fichas/soportes/soporte-universal.pdf",
      "code": "FT-MYV-46",
      "sizeKb": 118
    },
    "references": [
      {
        "code": "AC2201",
        "text": "Soporte universal de 10 cm"
      },
      {
        "code": "AC2301",
        "text": "Soporte universal de 20 cm"
      },
      {
        "code": "AC2401",
        "text": "Soporte universal de 30 cm"
      },
      {
        "code": "AC2501",
        "text": "Soporte universal de 40 cm"
      }
    ],
    "images": [
      {
        "file": "bandeja-ranurada30cm",
        "illustrative": true,
        "confirm": false
      }
    ],
    "pending": [
      "Foto real del producto (la actual es ilustrativa)",
      "Descripción comercial y especificaciones aprobadas por la empresa"
    ]
  }
};
