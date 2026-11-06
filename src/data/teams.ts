// All clubs and players are fictional. Any resemblance to real people is coincidental.

export type CrestPattern = 'plain' | 'stripes' | 'halves' | 'sash' | 'hoop' | 'chevron'

export interface Team {
  id: string
  name: string
  short: string // 3-letter code
  primary: string
  secondary: string
  pattern: CrestPattern
  players: string[] // three likely scorers, fictional
}

const t = (id: string, name: string, short: string, primary: string, secondary: string, pattern: CrestPattern, players: string[]): Team =>
  ({ id, name, short, primary, secondary, pattern, players })

export const teams: Record<string, Team> = Object.fromEntries(
  [
    t('harrowgate', 'Harrowgate', 'HAR', '#1F3A5F', '#F2C14E', 'stripes', ['E. Cardle', 'M. Ostrander', 'J. Wrexall']),
    t('redfield', 'Redfield Town', 'RED', '#B3261E', '#FFFFFF', 'hoop', ['K. Ambrose-Lyle', 'T. Halvard', 'D. Penrith']),
    t('aurelia', 'Aurelia SC', 'AUR', '#C9A227', '#16140F', 'halves', ['L. Vantaggio', 'M. Corvesi', 'A. Bellandri']),
    t('torrenza', 'Torrenza', 'TOR', '#5B2A86', '#FFFFFF', 'sash', ['R. Fiorandi', 'D. Castellone', 'G. Mirabeau']),
    t('elbstadt', 'Elbstadt 04', 'ELB', '#0E6B4F', '#FFFFFF', 'chevron', ['J. Wendrich', 'F. Oberlaus', 'N. Brakow']),
    t('dornbach', 'Dornbach FC', 'DOR', '#16140F', '#E4372B', 'stripes', ['T. Ziemer', 'L. Haubrecht', 'K. Ostwald']),
    t('kingsmere', 'Kingsmere United', 'KIN', '#2D5DA8', '#FFFFFF', 'plain', ['O. Trevethan', 'S. Adeyomi', 'C. Linwell']),
    t('castellar', 'Real Castellar', 'CAS', '#F4F1EA', '#7A1F2B', 'sash', ['I. Morvedra', 'A. Quintanal', 'P. Escobal']),
    t('varena', 'Atlético Varena', 'VAR', '#C0392B', '#1F3A5F', 'stripes', ['R. Tavernas', 'M. Ulloquí', 'D. Sarabel']),
    t('montalbo', 'CD Montalbo', 'MON', '#2E7D32', '#F2C14E', 'halves', ['E. Cabrejo', 'N. Villosa', 'T. Ondarra']),
    t('ashcombe', 'Ashcombe Rovers', 'ASH', '#3E6E8E', '#16140F', 'hoop', ['B. Haverill', 'J. Nkemdi', 'P. Stourton']),
    t('blackwater', 'Blackwater Athletic', 'BLA', '#2A2A2A', '#F2C14E', 'chevron', ['A. Mallinder', 'R. Ojukwen', 'L. Corrie']),
    t('calanne', 'Virtus Calanne', 'CAL', '#1C5D99', '#F4F1EA', 'stripes', ['F. Doratti', 'S. Ventrone', 'M. Lucarde']),
    t('montefiore', 'AC Montefiore', 'MTF', '#8E1B1B', '#16140F', 'halves', ['G. Strazzi', 'E. Tornavella', 'R. Caporin']),
    t('rheinau', 'SV Rheinau', 'RHE', '#D35400', '#FFFFFF', 'plain', ['M. Eichbaum', 'P. Grunwaldt', 'T. Lessig']),
    t('kalberg', 'Eintracht Kalberg', 'KAL', '#4A4A4A', '#C0392B', 'sash', ['D. Hollstein', 'J. Rauchfeld', 'B. Imkamp']),
    t('fenwick', 'Fenwick City', 'FEN', '#7FB3D5', '#16140F', 'plain', ['H. Selwood', 'K. Mbanefo', 'R. Thornbury']),
    t('albera', 'Sporting Albera', 'ALB', '#1E7B4A', '#FFFFFF', 'hoop', ['V. Peixeira', 'J. Doramar', 'F. Quelhas']),
    t('salvara', 'Deportivo Salvara', 'SAL', '#1A4E8A', '#FFFFFF', 'halves', ['C. Arbeloz', 'I. Senda', 'R. Valdemira']),
    t('corvera', 'UD Corvera', 'COR', '#E0B422', '#1A4E8A', 'chevron', ['P. Arnedal', 'G. Lusarreta', 'O. Benquera']),
  ].map((x) => [x.id, x]),
)
