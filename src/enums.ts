export enum QuizElementType {
  Cover = 'cover',
  LastCard = 'lastCard',
  MapPointGuess = 'mapPointGuess',
  MultipleChoice = 'multipleChoice',
  NumberGuess = 'numberGuess',
  NumberPoll = 'numberPoll',
}

export enum ImageFormat {
  JPG = 'jpg',
  PNG = 'png',
  WEBP = 'webp',
  PJPG = 'pjpg',
  WEBPLY = 'webply',
}

export enum Department {
  // Historically the value 'default' was used to
  // indicate that no department was selected.
  NONE = 'default',

  AD_BILD = 'AD/Bild',
  ANDERE = 'Andere',
  AUDIENCE_MANAGEMENT = 'Audience Management',
  CR = 'CR',
  DIGITAL = 'Digital',
  FEUILLETON_KULTUR = 'Feuilleton / Kultur',
  GESELLSCHAFT_WOCHENENDE = 'Gesellschaft / Wochenende',
  HINTERGRUND = 'Hintergrund',
  INTERNATIONAL = 'International',
  MEINUNG_DEBATTE = 'Meinung &amp Debatte',
  NEWSROOM = 'Newsroom',
  PANORAMA = 'Panorama',
  SCHWEIZ = 'Schweiz',
  SOCIAL_MEDIA = 'Social Media',
  SPORT = 'Sport',
  VIDEO = 'Video',
  VISUALS = 'Visuals',
  WEBPRODUKTION = 'Webproduktion',
  WIRTSCHAFT = 'Wirtschaft',
  WISSENSCHAFT = 'Wissenschaft',
  ZÜRICH = 'Zürich',
}

export enum Publication {
  // Historically the value 'default' was used to
  // indicate that no department was selected.
  NONE = 'default',

  NZZ = 'nzz',
  NZZaS = 'nzzas',
}

export enum ToolType {
  Chart = 'chart',
  Choropleth = 'choropleth',
  CoalitionCalculation = 'coalition_calculation',
  CustomCode = 'custom_code',

  // a.k.a: Seats in parliament.
  ElectionSeats = 'election_seats',

  // a.k.a: Executive election.
  ElectionExecutive = 'election_executive',

  // a.k.a Parliament election
  ElectionVotes = 'election_votes',

  Imageslider = 'imageslider',
  Infographic = 'infographic',
  LocatorMap = 'locator_map',

  PartySlogans = 'party_slogans',
  PollResults = 'poll_result',
  Quiz = 'quiz',
  ScrollGraphic = 'scroll_graphic',
  SwissVote = 'swiss_vote',
  Table = 'table',
}
