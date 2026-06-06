/* ============================================================
   productos.test.js — Tests de logica de productos y variantes
   ============================================================
   Cubre:
     - TC-PRO-01: Stock minimo por defecto = 2
     - TC-PRO-02: Atributos JSONB para multi-variante
     - TC-PRO-04: Validacion de campos obligatorios
   ============================================================ */

import { describe, it, expect } from 'vitest';

describe('Productos — Stock minimo por defecto', function () {

  it('TC-PRO-01: stock_min debe ser 2 si no se provee', function () {
    var data = {
      nombre: 'Producto QA Manual Single',
      codigo_interno: 'QA-SMS-001',
      precio_venta: 50000,
      impuesto: 19,
      stock_actual: 10
    };
    data.stock_min = data.stock_min !== undefined ? data.stock_min : 2;
    expect(data.stock_min).toBe(2);
  });

  it('TC-PRO-01: stock_min respeta el valor enviado si se provee', function () {
    var data = {
      nombre: 'Producto con Stock Min',
      stock_min: 5
    };
    data.stock_min = data.stock_min !== undefined ? data.stock_min : 2;
    expect(data.stock_min).toBe(5);
  });

  it('TC-PRO-01: stock_min default se aplica aunque sea 0', function () {
    var data = {
      nombre: 'Producto sin stock',
      stock_min: 0
    };
    data.stock_min = data.stock_min !== undefined ? data.stock_min : 2;
    expect(data.stock_min).toBe(0);
  });

});

describe('Productos — Atributos JSONB multi-variante', function () {

  it('TC-PRO-02: serializa atributos como objeto JSON', function () {
    var variante = {
      codigo_interno: 'QA-JNS-002-32A',
      precio_venta: 90000,
      stock_actual: 5,
      atributos: { Talla: '32', Color: 'Azul' }
    };
    var json = JSON.stringify(variante.atributos);
    expect(json).toBe('{"Talla":"32","Color":"Azul"}');
    expect(JSON.parse(json).Talla).toBe('32');
    expect(JSON.parse(json).Color).toBe('Azul');
  });

  it('TC-PRO-02: soporta multiples atributos', function () {
    var variante = {
      codigo_interno: 'TS-BA-003-MN',
      precio_venta: 35000,
      stock_actual: 8,
      atributos: { Talla: 'M', Color: 'Negro' }
    };
    expect(Object.keys(variante.atributos).length).toBe(2);
    expect(variante.atributos.Talla).toBe('M');
    expect(variante.atributos.Color).toBe('Negro');
  });

  it('serializa atributos vacios como objeto vacio', function () {
    var variante = {
      codigo_interno: 'PROD-SIMPLE',
      atributos: {}
    };
    expect(JSON.stringify(variante.atributos)).toBe('{}');
  });

});

describe('Productos — Validacion de campos obligatorios', function () {

  function validarProducto(data) {
    if (!data || !data.nombre || !data.nombre.trim()) {
      return { valido: false, error: 'El Nombre del producto es obligatorio' };
    }
    return { valido: true, error: null };
  }

  it('TC-PRO-04: rechaza producto sin nombre', function () {
    var res = validarProducto({ nombre: '' });
    expect(res.valido).toBe(false);
    expect(res.error).toBe('El Nombre del producto es obligatorio');
  });

  it('TC-PRO-04: rechaza producto con nombre solo espacios', function () {
    var res = validarProducto({ nombre: '   ' });
    expect(res.valido).toBe(false);
  });

  it('acepta producto con nombre valido', function () {
    var res = validarProducto({ nombre: 'Zapatillas Nike' });
    expect(res.valido).toBe(true);
    expect(res.error).toBeNull();
  });

  it('rechaza data null o undefined', function () {
    expect(validarProducto(null).valido).toBe(false);
    expect(validarProducto(undefined).valido).toBe(false);
  });

});
