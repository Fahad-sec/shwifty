export const sanitize = (rawInput: string): string => {
  if (!rawInput) return '';
   
  const placeholder = document.createElement('div');
  placeholder.innerText = rawInput;
  return placeholder.innerHTML


}