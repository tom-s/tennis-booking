 export const MS_PER_HOUR = 3600000

 export const pad = (num, size=2) => {
  let s = num +'';
  while (s.length < size) s = '0' + s
  return s
}
 