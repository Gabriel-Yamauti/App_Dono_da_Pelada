/**
 * Dados MOCK (hardcoded) da aba Reservas — marketplace de campos.
 *
 * Arrays fixos para degradação graciosa enquanto a feature real (T1.5) não existe.
 * Sem imagens de rede: a foto é um placeholder local (CH-06). Sem PII (CH-15).
 */

export type Campo = {
  id: string;
  nome: string;
  bairro: string;
  /** preço por hora em reais (número p/ futura ordenação/filtro) */
  precoHora: number;
  nota: number;
  avaliacoes: number;
  /** horários livres mockados (chips) */
  horarios: string[];
  comodidades: string[];
  /** tipo de gramado/quadra — exibido como legenda */
  tipo: string;
  /** ícone Ionicons outline usado no placeholder de foto */
  destaque: boolean;
};

export const CAMPOS: Campo[] = [
  {
    id: 'f1',
    nome: 'Society do Zé',
    bairro: 'Vila Madalena',
    precoHora: 120,
    nota: 4.8,
    avaliacoes: 213,
    horarios: ['18:00', '19:00', '21:00'],
    comodidades: ['Grama sintética', 'Vestiário', 'Estacionamento'],
    tipo: 'Society 7 · sintético',
    destaque: true,
  },
  {
    id: 'f2',
    nome: 'Quadra Central',
    bairro: 'Centro',
    precoHora: 90,
    nota: 4.5,
    avaliacoes: 134,
    horarios: ['07:00', '08:00', '20:00', '22:00'],
    comodidades: ['Coberta', 'Iluminação', 'Lanchonete'],
    tipo: 'Futsal · piso oficial',
    destaque: false,
  },
  {
    id: 'f3',
    nome: 'Arena Bola na Rede',
    bairro: 'Santo Amaro',
    precoHora: 150,
    nota: 4.9,
    avaliacoes: 311,
    horarios: ['19:00', '20:00'],
    comodidades: ['Grama sintética', 'Vestiário', 'Bar', 'Wi-Fi'],
    tipo: 'Society 9 · sintético',
    destaque: true,
  },
  {
    id: 'f4',
    nome: 'Campo do Bairro',
    bairro: 'Butantã',
    precoHora: 70,
    nota: 4.2,
    avaliacoes: 88,
    horarios: ['16:00', '17:00', '18:00'],
    comodidades: ['Grama natural', 'Arquibancada'],
    tipo: 'Campo 11 · grama natural',
    destaque: false,
  },
];

/** Filtros mock (estáticos) exibidos como chips no topo do marketplace. */
export const FILTROS: string[] = ['Todos', 'Society', 'Futsal', 'Coberto', 'Até R$ 100'];
