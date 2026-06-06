/* ============================================================
   caja.test.js — Tests de calculos de apertura y cierre de caja
   ============================================================
   Cubre:
     - TC-CAJ-02: Cuadre perfecto con diferencia $0
     - TC-CAJ-03: Descuadre con faltante de $10,000
     - Varios metodos de pago (no solo efectivo)
     - Sin ventas en el periodo
   ============================================================ */

import { describe, it, expect } from 'vitest';
import { calcularDiferenciaCaja, formatearMoneda } from '../helpers/calculos-pos.js';

describe('calcularDiferenciaCaja', function () {

  it('TC-CAJ-02: cuadre perfecto, diferencia $0', function () {
    var ventas = [
      { metodo_pago: 'efectivo', total: 100000 }
    ];
    var res = calcularDiferenciaCaja(150000, ventas, 250000);
    expect(res.ventasEfectivo).toBe(100000);
    expect(res.esperado).toBe(250000);
    expect(res.diferencia).toBe(0);
  });

  it('TC-CAJ-03: descuadre con faltante de $10,000', function () {
    var ventas = [
      { metodo_pago: 'efectivo', total: 100000 }
    ];
    var res = calcularDiferenciaCaja(150000, ventas, 240000);
    expect(res.ventasEfectivo).toBe(100000);
    expect(res.esperado).toBe(250000);
    expect(res.diferencia).toBe(-10000);
  });

  it('filtra solo metodos efectivo, ignora tarjeta/transferencia', function () {
    var ventas = [
      { metodo_pago: 'efectivo', total: 50000 },
      { metodo_pago: 'tarjeta', total: 200000 },
      { metodo_pago: 'transferencia', total: 150000 }
    ];
    var res = calcularDiferenciaCaja(100000, ventas, 150000);
    expect(res.ventasEfectivo).toBe(50000);
    expect(res.esperado).toBe(150000);
    expect(res.diferencia).toBe(0);
  });

  it('sin ventas en el periodo, esperado = monto inicial', function () {
    var res = calcularDiferenciaCaja(200000, [], 200000);
    expect(res.ventasEfectivo).toBe(0);
    expect(res.esperado).toBe(200000);
    expect(res.diferencia).toBe(0);
  });

  it('ventas undefined se trata como array vacio', function () {
    var res = calcularDiferenciaCaja(100000, undefined, 100000);
    expect(res.ventasEfectivo).toBe(0);
    expect(res.diferencia).toBe(0);
  });

  it('monto final mayor al esperado genera diferencia positiva (sobrante)', function () {
    var ventas = [
      { metodo_pago: 'efectivo', total: 50000 }
    ];
    var res = calcularDiferenciaCaja(100000, ventas, 200000);
    expect(res.diferencia).toBe(50000);
  });

});

describe('formatearMoneda', function () {

  it('formatea 250000 como $250.000 (es-CO)', function () {
    expect(formatearMoneda(250000)).toBe('$250.000');
  });

  it('formatea 0 como $0', function () {
    expect(formatearMoneda(0)).toBe('$0');
  });

  it('formatea string numerico', function () {
    expect(formatearMoneda('100000')).toBe('$100.000');
  });

  it('formatea -10000 como $-10.000 (signo tras $)', function () {
    expect(formatearMoneda(-10000)).toBe('$-10.000');
  });

});
