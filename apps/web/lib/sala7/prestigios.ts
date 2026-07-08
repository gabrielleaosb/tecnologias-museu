const CHAVE = "sala7_prestigiados";

function lerLista(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
  } catch {
    return [];
  }
}

export function jaPrestigiou(id: string): boolean {
  return lerLista().includes(id);
}

export function marcarPrestigiado(id: string): void {
  const lista = lerLista();
  if (!lista.includes(id)) {
    localStorage.setItem(CHAVE, JSON.stringify([...lista, id]));
  }
}
