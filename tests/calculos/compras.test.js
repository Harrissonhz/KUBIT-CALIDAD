/* ============================================================
   compras.test.js — Tests de calculos de ordenes de compra
   ============================================================
   Cubre:
     - TC-COM-01: Calculo de totales con IVA 19% y descuento
     - Calculo por item individual
     - Item exento (IVA 0%)
     - verificarDescuentoPermitido()
   ============================================================ */

import { describe, it, expect } from 'vitest';
import {
  calcularIvaItem,
  calcularTotalesCompra,
  verificarDescuentoPermitido,
  formatCOP
} from '../helpers/calculos-pos.js';

describe('calcularIvaItem', function () {

  it('TC-COM-01: calcula item con IVA 19% y sin descuento por fila', function () {
    var res = calcularIvaItem(10, 60000, 0, 0.19);
    // totalConIva = 10 * 60000 * 1.0 = 600000
    // subtotal = 600000 / 1.19 = 504201.68...
    // impuesto = 600000 - 504201.68 = 95798.31...
    expect(res.subtotal).toBeCloseTo(504201.68, -2);
    expect(res.impuesto).toBeCloseTo(95798.32, -2);
    expect(res.total).toBe(600000);
  });

  it('calcula item con IVA 19% y descuento del 10% en la fila', function () {
    var res = calcularIvaItem(5, 50000, 10, 0.19);
    // totalConIva = 5 * 50000 * 0.9 = 225000
    // subtotal = 225000 / 1.19 = 189075.63...
    // impuesto = 225000 - 189075.63 = 35924.37...
    expect(res.subtotal).toBeCloseTo(189075.63, -2);
    expect(res.impuesto).toBeCloseTo(35924.37, -2);
    expect(res.total).toBe(225000);
  });

  it('calcula item exento (IVA 0%)', function () {
    var res = calcularIvaItem(3, 20000, 0, 0);
    // totalConIva = 3 * 20000 = 60000
    // subtotal = 60000 / 1.0 = 60000
    // impuesto = 60000 - 60000 = 0
    expect(res.subtotal).toBe(60000);
    expect(res.impuesto).toBe(0);
    expect(res.total).toBe(60000);
  });

});

describe('calcularTotalesCompra', function () {

  it('TC-COM-01: calcula total de compra con descuento global 5%', function () {
    var items = [calcularIvaItem(10, 60000, 0, 0.19)];
    var res = calcularTotalesCompra(items, 5);
    // Subtotal neto: 504201.68 * (100-5)/100 = 478991.60...
    // Impuesto neto: 95798.32 * 0.95 = 91008.40...
    // Total final: 600000 * 0.95 = 570000
    // PERO la formula real suma: totalConIvaSum * factorDesc
    // totalConIvaSum = 600000, factorDesc = 0.95 => total = 570000
    // subtotalSum = 504201.68, * 0.95 = 478991.60
    // impuestoSum = 95798.32, * 0.95 = 91008.40
    expect(res.subtotal).toBeCloseTo(478991.60, -2);
    expect(res.impuesto).toBeCloseTo(91008.40, -2);
    expect(res.total).toBeCloseTo(570000, -2);
  });

  it('suma multiples items correctamente', function () {
    var items = [
      calcularIvaItem(2, 10000, 0, 0.19),    // total: 20000
      calcularIvaItem(3, 5000, 0, 0)          // total: 15000
    ];
    var res = calcularTotalesCompra(items, 0);
    expect(res.total).toBe(35000);
  });

  it('aplica descuento global del 100% = total 0', function () {
    var items = [calcularIvaItem(10, 60000, 0, 0.19)];
    var res = calcularTotalesCompra(items, 100);
    expect(res.total).toBe(0);
    expect(res.subtotal).toBeCloseTo(0, -2);
    expect(res.impuesto).toBeCloseTo(0, -2);
  });

});

describe('verificarDescuentoPermitido', function () {

  it('permite descuento dentro del limite', function () {
    expect(verificarDescuentoPermitido(10, 15)).toBe(true);
    expect(verificarDescuentoPermitido(0, 10)).toBe(true);
  });

  it('TC-VEN-05: rechaza descuento que excede el limite del rol', function () {
    expect(verificarDescuentoPermitido(15, 10)).toBe(false);
  });

  it('permite descuento igual al limite', function () {
    expect(verificarDescuentoPermitido(10, 10)).toBe(true);
  });

});

describe('formatCOP', function () {

  it('formatea 678300 como $678,300', function () {
    expect(formatCOP(678300)).toBe('$678,300');
  });

  it('formatea 0 como $0', function () {
    expect(formatCOP(0)).toBe('$0');
  });

  it('formatea 1000000 como $1,000,000', function () {
    expect(formatCOP(1000000)).toBe('$1,000,000');
  });

});
