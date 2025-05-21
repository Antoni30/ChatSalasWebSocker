export function generarPinUnico6Digitos() {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  return pin;
}
