// shiftCountColor.ts
export const getShiftCountColor = (shift: string) => {
  const s = shift?.toUpperCase();

  switch (s) {
    case "G": return { bg: "#B4D6ED", text: "#000" };
    case "N": return { bg: "#000087", text: "#fff" };
    case "B": return { bg: "#F7A100", text: "#000" };
    case "LG": return { bg: "#84E086", text: "#000" };
    case "A": return { bg: "#F7F7BE", text: "#000" };
    case "TOTAL COUNT": return { bg: "#0A8F08", text: "#fff" };
    default: return { bg: "#E0E0E0", text: "#000" };
  }
};