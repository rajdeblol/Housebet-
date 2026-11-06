// Club/franchise identities use real team names and badges; fixtures, scores, player names, and demo profiles remain simulated.

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
    // ---- Basketball (real NBA franchises; fixtures and results remain simulated)
    t('calder', 'Boston Celtics', 'BOS', '#007A33', '#FFFFFF', 'plain', []),
    t('ironvale', 'Los Angeles Lakers', 'LAL', '#552583', '#FDB927', 'chevron', []),
    t('sunmere', 'Golden State Warriors', 'GSW', '#1D428A', '#FFC72C', 'sash', []),
    t('portwell', 'Chicago Bulls', 'CHI', '#CE1141', '#000000', 'hoop', []),
    t('granite', 'Miami Heat', 'MIA', '#98002E', '#F9A01B', 'halves', []),
    t('lakeshore', 'New York Knicks', 'NYK', '#006BB6', '#F58426', 'stripes', []),
    t('brightwater', 'Dallas Mavericks', 'DAL', '#00538C', '#B8C4CA', 'plain', []),
    t('corran', 'Milwaukee Bucks', 'MIL', '#00471B', '#EEE1C6', 'sash', []),
    // ---- American football (real NFL franchises; fixtures and results remain simulated)
    t('kestrel', 'Atlanta Falcons', 'ATL', '#A71930', '#000000', 'chevron', []),
    t('ironbridge', 'Green Bay Packers', 'GB', '#203731', '#FFB612', 'stripes', []),
    t('delmont', 'Dallas Cowboys', 'DAL', '#003594', '#869397', 'halves', []),
    t('cascade', 'Kansas City Chiefs', 'KC', '#E31837', '#FFB81C', 'hoop', []),
    t('northgate', 'Baltimore Ravens', 'BAL', '#241773', '#9E7C0C', 'plain', []),
    t('riverbend', 'San Francisco 49ers', 'SF', '#AA0000', '#B3995D', 'sash', []),
    t('saltmarsh', 'Buffalo Bills', 'BUF', '#00338D', '#C60C30', 'chevron', []),
    t('coldwater', 'Philadelphia Eagles', 'PHI', '#004C54', '#A5ACAF', 'stripes', []),
    // ---- Baseball (real MLB franchises, including the requested Braves and Rays)
    t('pinecrest', 'Atlanta Braves', 'ATL', '#CE1141', '#13274F', 'stripes', []),
    t('marlowe', 'Tampa Bay Rays', 'TB', '#092C5C', '#8FBCE6', 'plain', []),
    t('eastport', 'Los Angeles Dodgers', 'LAD', '#005A9C', '#EF3E42', 'hoop', []),
    t('sandcastle', 'New York Yankees', 'NYY', '#003087', '#E4002B', 'halves', []),
    t('redstone', 'Chicago Cubs', 'CHC', '#0E3386', '#CC3433', 'chevron', []),
    t('bluewater', 'Boston Red Sox', 'BOS', '#BD3039', '#0C2340', 'sash', []),
    t('fairhaven', 'Toronto Blue Jays', 'TOR', '#134A8E', '#1D2D5C', 'plain', []),
    t('ironwood', 'Seattle Mariners', 'SEA', '#0C2C56', '#005C5C', 'stripes', []),
    // ---- Ice hockey (real NHL franchises; fixtures and results remain simulated)
    t('frostholm', 'Boston Bruins', 'BOS', '#FFB81C', '#000000', 'chevron', []),
    t('glacier', 'Toronto Maple Leafs', 'TOR', '#003E7E', '#FFFFFF', 'halves', []),
    t('northshire', 'Montreal Canadiens', 'MTL', '#AF1E2D', '#192168', 'plain', []),
    t('baymouth', 'New York Rangers', 'NYR', '#0038A8', '#CE1126', 'hoop', []),
    t('halden', 'Edmonton Oilers', 'EDM', '#041E42', '#FF4C00', 'sash', []),
    t('copperfield', 'Colorado Avalanche', 'COL', '#6F263D', '#236192', 'stripes', []),
    t('ashgrove', 'Vegas Golden Knights', 'VGK', '#B4975A', '#333F42', 'chevron', []),
    t('lakeport', 'Pittsburgh Penguins', 'PIT', '#FCB514', '#000000', 'plain', []),
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
