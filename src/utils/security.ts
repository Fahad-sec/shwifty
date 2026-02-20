export const sanitize = (rawInput: string): string => {
  if (!rawInput) return '';
    
  return rawInput
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")

}