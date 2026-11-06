// Football and IPL team identities use real names and crests; other seeded participants and all match data are demo fixtures.

export type CrestPattern = 'plain' | 'stripes' | 'halves' | 'sash' | 'hoop' | 'chevron'

export interface Team {
  id: string
  name: string
  short: string // 3-letter code
  primary: string
  secondary: string
  pattern: CrestPattern
  players: string[] // three likely scorers, fictional
  logo?: string
}

const t = (id: string, name: string, short: string, primary: string, secondary: string, pattern: CrestPattern, players: string[], logo?: string): Team =>
  ({ id, name, short, primary, secondary, pattern, players, logo })

export const teams: Record<string, Team> = Object.fromEntries(
  [
    t('harrowgate', 'Arsenal', 'ARS', '#EF0107', '#FFFFFF', 'stripes', ['E. Cardle', 'M. Ostrander', 'J. Wrexall'], 'team-logos/arsenal.png'),
    t('redfield', 'Chelsea', 'CHE', '#034694', '#DBA111', 'hoop', ['K. Ambrose-Lyle', 'T. Halvard', 'D. Penrith'], 'team-logos/chelsea.png'),
    t('aurelia', 'Real Madrid', 'RMA', '#FEBE10', '#00529F', 'halves', ['L. Vantaggio', 'M. Corvesi', 'A. Bellandri'], 'team-logos/real-madrid.png'),
    t('torrenza', 'Barcelona', 'BAR', '#A50044', '#004D98', 'sash', ['R. Fiorandi', 'D. Castellone', 'G. Mirabeau'], 'team-logos/barcelona.png'),
    t('elbstadt', 'Bayern Munich', 'BAY', '#DC052D', '#0066B2', 'chevron', ['J. Wendrich', 'F. Oberlaus', 'N. Brakow'], 'team-logos/bayern.png'),
    t('dornbach', 'Borussia Dortmund', 'DOR', '#FDE100', '#000000', 'stripes', ['T. Ziemer', 'L. Haubrecht', 'K. Ostwald'], 'team-logos/dortmund.png'),
    t('kingsmere', 'Liverpool', 'LIV', '#C8102E', '#00B2A9', 'plain', ['O. Trevethan', 'S. Adeyomi', 'C. Linwell'], 'team-logos/liverpool.png'),
    t('castellar', 'Manchester City', 'MCI', '#6CABDD', '#1C2C5B', 'sash', ['I. Morvedra', 'A. Quintanal', 'P. Escobal'], 'team-logos/man-city.png'),
    t('varena', 'Atlético Madrid', 'ATM', '#CE3524', '#FFFFFF', 'stripes', ['R. Tavernas', 'M. Ulloquí', 'D. Sarabel'], 'team-logos/atletico.png'),
    t('montalbo', 'Tottenham Hotspur', 'TOT', '#132257', '#FFFFFF', 'halves', ['E. Cabrejo', 'N. Villosa', 'T. Ondarra'], 'team-logos/tottenham.png'),
    t('ashcombe', 'Newcastle United', 'NEW', '#241F20', '#FFFFFF', 'hoop', ['B. Haverill', 'J. Nkemdi', 'P. Stourton'], 'team-logos/newcastle.png'),
    t('blackwater', 'Aston Villa', 'AVL', '#670E36', '#95BFE5', 'chevron', ['A. Mallinder', 'R. Ojukwen', 'L. Corrie'], 'team-logos/aston-villa.png'),
    t('calanne', 'AC Milan', 'MIL', '#FB090B', '#000000', 'stripes', ['F. Doratti', 'S. Ventrone', 'M. Lucarde'], 'team-logos/ac-milan.png'),
    t('montefiore', 'Inter Milan', 'INT', '#0068A8', '#000000', 'halves', ['G. Strazzi', 'E. Tornavella', 'R. Caporin'], 'team-logos/inter.png'),
    t('rheinau', 'Juventus', 'JUV', '#000000', '#FFFFFF', 'plain', ['M. Eichbaum', 'P. Grunwaldt', 'T. Lessig'], 'team-logos/juventus.png'),
    t('kalberg', 'Napoli', 'NAP', '#12A0D7', '#FFFFFF', 'sash', ['D. Hollstein', 'J. Rauchfeld', 'B. Imkamp'], 'team-logos/napoli.png'),
    t('fenwick', 'Paris Saint-Germain', 'PSG', '#004170', '#DA291C', 'plain', ['H. Selwood', 'K. Mbanefo', 'R. Thornbury'], 'team-logos/psg.png'),
    t('albera', 'Benfica', 'BEN', '#E83030', '#FFFFFF', 'hoop', ['V. Peixeira', 'J. Doramar', 'F. Quelhas'], 'team-logos/benfica.png'),
    t('salvara', 'Sporting CP', 'SCP', '#008753', '#F0C400', 'halves', ['C. Arbeloz', 'I. Senda', 'R. Valdemira'], 'team-logos/sporting.png'),
    t('corvera', 'FC Porto', 'FCP', '#00529F', '#FFFFFF', 'chevron', ['P. Arnedal', 'G. Lusarreta', 'O. Benquera'], 'team-logos/porto.png'),
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
    t('saffron', 'Chennai Super Kings', 'CSK', '#F9CD05', '#1E3A8A', 'sash', ['A. Venkatram', 'R. Dalvey', 'S. Moreland'], 'cricket-team-logos/chennai-csk.png'),
    t('monsoon', 'Mumbai Indians', 'MI', '#004BA0', '#D1AB3E', 'hoop', ['K. Ashwath', 'T. Brannigan', 'J. Ruparel'], 'cricket-team-logos/mumbai-mi.png'),
    t('banyan', 'Kolkata Knight Riders', 'KKR', '#3A225D', '#D4AF37', 'chevron', ['P. Iyengar-Sole', 'D. Wakefield', 'M. Okonji'], 'cricket-team-logos/kolkata-kkr.png'),
    t('seabreeze', 'Royal Challengers Bengaluru', 'RCB', '#D71920', '#111111', 'halves', ['H. Rawdon', 'V. Kalyani', 'L. Strathie'], 'cricket-team-logos/bengaluru-rcb.png'),
    t('teagarden', 'Sunrisers Hyderabad', 'SRH', '#F26522', '#111111', 'stripes', [], 'cricket-team-logos/hyderabad-srh.png'),
    t('redearth', 'Rajasthan Royals', 'RR', '#EA1A85', '#254AA5', 'plain', [], 'cricket-team-logos/rajasthan-rr.png'),
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
