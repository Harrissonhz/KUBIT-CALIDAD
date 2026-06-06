/* ============================================================
   calculos-pos.js — Funciones de calculo del POS
   Funciones puras extraidas de la logica de negocio para
   ser testables sin DOM ni base de datos.
   ============================================================ */

function calcularIvaItem(cantidad, precioUnitario, descuento, tasaImpuesto) {
  var totalConIva = (cantidad || 0) * (precioUnitario || 0) * (1 - (descuento || 0) / 100);
  var subtotal = totalConIva / (1 + (tasaImpuesto || 0));
  var impuesto = totalConIva - subtotal;
  var total = totalConIva;
  return { subtotal: subtotal, impuesto: impuesto, total: total };
}

function calcularTotalesCompra(items, descuentoGlobal) {
  var totalConIvaSum = 0, subtotalSum = 0, impuestoSum = 0;
  items.forEach(function (d) {
    totalConIvaSum += d.total || 0;
    subtotalSum += d.subtotal || 0;
    impuestoSum += d.impuesto || 0;
  });
  var factorDesc = (100 - (descuentoGlobal || 0)) / 100;
  return {
    subtotal: subtotalSum * factorDesc,
    impuesto: impuestoSum * factorDesc,
    total: totalConIvaSum * factorDesc
  };
}

function calcularDiferenciaCaja(montoInicial, ventasPeriodo, montoFinal) {
  var ventasEfectivo = (ventasPeriodo || [])
    .filter(function (v) { return v.metodo_pago === 'efectivo'; })
    .reduce(function (s, v) { return s + (v.total || 0); }, 0);
  var esperado = (montoInicial || 0) + ventasEfectivo;
  var diferencia = (montoFinal || 0) - esperado;
  return { ventasEfectivo: ventasEfectivo, esperado: esperado, diferencia: diferencia };
}

function verificarDescuentoPermitido(descuento, maxPermitido) {
  return (descuento || 0) <= (maxPermitido || 0);
}

function formatCOP(val) {
  return '$' + String(Math.round(val || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatearMoneda(valor) {
  var num = Number(valor || 0);
  return '$' + num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

if (typeof module !== 'undefined') {
  module.exports = {
    calcularIvaItem: calcularIvaItem,
    calcularTotalesCompra: calcularTotalesCompra,
    calcularDiferenciaCaja: calcularDiferenciaCaja,
    verificarDescuentoPermitido: verificarDescuentoPermitido,
    formatCOP: formatCOP,
    formatearMoneda: formatearMoneda
  };
}
