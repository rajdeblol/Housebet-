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
    // ---- Basketball (NBA, fictional franchises)
    t('calder', 'Calder Bay Comets', 'CBC', '#1B3B6F', '#F2C14E', 'plain', []),
    t('ironvale', 'Ironvale Forge', 'IVF', '#3A3A3A', '#E4572E', 'chevron', []),
    t('sunmere', 'Sunmere Hawks', 'SUN', '#E07A1F', '#1F2A44', 'sash', []),
    t('portwell', 'Portwell Tides', 'PWT', '#167D7F', '#F4F1EA', 'hoop', []),
    t('granite', 'Granite Peak Rams', 'GPR', '#6B4E3D', '#F4F1EA', 'halves', []),
    t('lakeshore', 'Lakeshore Lynx', 'LSL', '#2E5E4E', '#C9A227', 'stripes', []),
    t('brightwater', 'Brightwater Owls', 'BWO', '#4B2E83', '#F2C14E', 'plain', []),
    t('corran', 'Corran City Vipers', 'CCV', '#0F7B3A', '#16140F', 'sash', []),
    // ---- American football (NFL, fictional franchises)
    t('kestrel', 'Kestrel Bay Kestrels', 'KBK', '#0B3C5D', '#D9B310', 'chevron', []),
    t('ironbridge', 'Ironbridge Miners', 'IBM', '#2B2B2B', '#B87333', 'stripes', []),
    t('delmont', 'Delmont Stallions', 'DEL', '#7A1F2B', '#F4F1EA', 'halves', []),
    t('cascade', 'Cascade Lumberjacks', 'CAS', '#2F5233', '#E8C547', 'hoop', []),
    t('northgate', 'Northgate Sentinels', 'NGS', '#22356F', '#C0C0C0', 'plain', []),
    t('riverbend', 'Riverbend Bisons', 'RBB', '#5C3A21', '#F2C14E', 'sash', []),
    t('saltmarsh', 'Saltmarsh Herons', 'SMH', '#4A7C8C', '#16140F', 'chevron', []),
    t('coldwater', 'Coldwater Wolves', 'CWW', '#5B6770', '#C62F25', 'stripes', []),
    // ---- Baseball (MLB, fictional franchises)
    t('pinecrest', 'Pinecrest Owls', 'PCO', '#1E4D2B', '#F4F1EA', 'stripes', []),
    t('marlowe', 'Marlowe Foundrymen', 'MFM', '#3C3C3C', '#D35400', 'plain', []),
    t('eastport', 'Eastport Anchors', 'EPA', '#13294B', '#C62F25', 'hoop', []),
    t('sandcastle', 'Sandcastle Crabs', 'SCC', '#D96C3F', '#13294B', 'halves', []),
    t('redstone', 'Redstone Badgers', 'RSB', '#8E1B1B', '#F4F1EA', 'chevron', []),
    t('bluewater', 'Bluewater Herons', 'BWH', '#1C6EA4', '#F2C14E', 'sash', []),
    t('fairhaven', 'Fairhaven Larks', 'FHL', '#6A994E', '#16140F', 'plain', []),
    t('ironwood', 'Ironwood Hammers', 'IWH', '#4E4E50', '#E9B949', 'stripes', []),
    // ---- Ice hockey (NHL, fictional franchises)
    t('frostholm', 'Frostholm Lynx', 'FRL', '#2C4A6B', '#E8F1F2', 'chevron', []),
    t('glacier', 'Glacier Point Stags', 'GPS', '#5B7DB1', '#16140F', 'halves', []),
    t('northshire', 'Northshire Wolves', 'NSW', '#3E3E3E', '#B3261E', 'plain', []),
    t('baymouth', 'Baymouth Pike', 'BMP', '#0E6B4F', '#F2C14E', 'hoop', []),
    t('halden', 'Halden Ravens', 'HDR', '#16140F', '#C9A227', 'sash', []),
    t('copperfield', 'Copperfield Moose', 'CFM', '#B87333', '#16140F', 'stripes', []),
    t('ashgrove', 'Ashgrove Owls', 'AGO', '#4B6043', '#F4F1EA', 'chevron', []),
    t('lakeport', 'Lakeport Sturgeon', 'LPS', '#1F4E79', '#9BC1BC', 'plain', []),
    // ---- Cricket (fictional T20 franchises)
    t('saffron', 'Saffron Coast Chargers', 'SCC', '#E37222', '#13294B', 'sash', ['A. Venkatram', 'R. Dalvey', 'S. Moreland']),
    t('monsoon', 'Monsoon Riders', 'MNR', '#1D5C96', '#F4F1EA', 'hoop', ['K. Ashwath', 'T. Brannigan', 'J. Ruparel']),
    t('banyan', 'Banyan City Blazers', 'BCB', '#B3261E', '#F2C14E', 'chevron', ['P. Iyengar-Sole', 'D. Wakefield', 'M. Okonji']),
    t('seabreeze', 'Seabreeze Falcons', 'SBF', '#2A9D8F', '#16140F', 'halves', ['H. Rawdon', 'V. Kalyani', 'L. Strathie']),
    t('teagarden', 'Tea Garden Titans', 'TGT', '#2E7D32', '#E9B949', 'stripes', []),
    t('redearth', 'Red Earth Rhinos', 'RER', '#8C3B2E', '#F4F1EA', 'plain', []),
    // ---- MMA (fictional fighters)
    t('morcaster', 'Ilan Morcaster', 'MOR', '#B3261E', '#16140F', 'plain', []),
    t('okonkwehale', 'Dex Okonkwe-Hale', 'OKH', '#1F3A5F', '#F4F1EA', 'plain', []),
    t('saalberg', 'Viktor Saalberg', 'SAA', '#4A4A4A', '#E9B949', 'plain', []),
    t('talverde', 'Joaquín Talverde', 'TAL', '#0E6B4F', '#F4F1EA', 'plain', []),
    t('wrenhollow', 'Kai Wrenhollow', 'WRN', '#5B2A86', '#F4F1EA', 'plain', []),
    t('quillen', 'Amaru Quillen', 'QUI', '#C9A227', '#16140F', 'plain', []),
    // ---- Tennis (fictional players)
    t('varenne', 'Lucien Varenne', 'VAR', '#2F5D8A', '#F4F1EA', 'plain', []),
    t('strand', 'Tobiah Strand', 'STR', '#C96B2C', '#16140F', 'plain', []),
    t('corvaro', 'Matteo Corvaro', 'COR', '#1E7B4A', '#F4F1EA', 'plain', []),
    t('northam', 'Elias Northam', 'NOR', '#7A1F2B', '#F4F1EA', 'plain', []),
    t('haverkamp', 'Niklas Haverkamp', 'HAV', '#16140F', '#E9B949', 'plain', []),
    t('valich', 'Teodor Valich', 'VAL', '#4B6043', '#F4F1EA', 'plain', []),
  ].map((x) => [x.id, x]),
)
