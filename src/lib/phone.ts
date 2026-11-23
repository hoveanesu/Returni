// Normalises Zimbabwe mobile numbers to +263XXXXXXXXX. Returns null if invalid.
export function normalizeZwPhone(input: string): string | null {
    let d = input.replace(/\D/g, "");
    if (d.startsWith("263")) d = d.slice(3);
    else if (d.startsWith("0")) d = d.slice(1);
    if (!/^7\d{8}$/.test(d)) return null;
    return `+263${d}`;
  }
  
  export function maskPhone(p: string): string {
    return `${p.slice(0, 7)} *** ${p.slice(-3)}`;
  }