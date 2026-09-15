const INICIO_EXPEDIENTE_MIN = 8 * 60; // 08:00
const FIM_EXPEDIENTE_MIN = 18 * 60; // 18:00

export function gerarSlots(duracaoMin) {
  const slots = [];
  for (let m = INICIO_EXPEDIENTE_MIN; m < FIM_EXPEDIENTE_MIN; m += duracaoMin) {
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${h}:${mm}`);
  }
  return slots;
}

export function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
