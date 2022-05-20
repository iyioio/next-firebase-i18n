export interface Strings
{
  key:string;
  language:string;
  header:string;
  body:string;
}

const strings:Strings[]=[
  {
    key:'index',
    language:'en',
    header:'The weather tody',
    body:'It\'s hot and sunny'
  },
  {
    key:'index',
    language:'es',
    header:'El tiempo hoy',
    body:'Hace calor y está soleado'
  },
  {
    key:'other',
    language:'en',
    header:'The OTHER weather tody',
    body:'o-It\'s hot and sunny'
  },
  {
    key:'other',
    language:'es',
    header:'El OTHER tiempo hoy',
    body:'o-Hace calor y está soleado'
  },
]

export function getStrings(key:string, locale:string|undefined):Strings|null
{
    const lang=locale?.split('-')[0]||'en';
    return strings.find(s=>s.key===key && s.language===lang)||null;
}