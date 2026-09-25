import type { CarView } from '../types'

/**
 * Catalogo editoriale: categoria, anno, scheda tecnica, punti di forza e foto.
 *
 * L'API espone solo i dati commerciali (marca, modello, descrizione, prezzi), quindi tutto
 * ciò che è redazionale vive qui. Le voci si agganciano all'auto per marca e modello:
 * prima si tenta la corrispondenza esatta, poi quella per sottostringa, così un modello
 * scritto leggermente diverso dall'amministratore trova comunque la sua scheda.
 */

export type CarCategoryId = 'classiche' | 'supercar' | 'suv' | 'hypercar' | 'utilitarie' | 'special'

export interface CarCategory {
  id: CarCategoryId
  /** Etichetta breve per la navigazione */
  label: string
  /** Occhiello sopra il titolo della sezione */
  eyebrow: string
  /** Frase d'atmosfera: cambia il tono insieme allo sfondo */
  tagline: string
}

export interface CarColorImage {
  label: string
  color: string
  src: string
}

export interface CarSpecs {
  motore: string
  potenza: string
  coppia: string
  accelerazione: string
  velocita: string
  trazione: string
  cambio: string
}

export interface CarProfile {
  category: CarCategoryId
  anno: string
  /** Claim editoriale mostrato sotto il modello */
  claim: string
  specs: CarSpecs
  strengths: readonly string[]
  images: readonly CarColorImage[]
  /** true quando la foto non ritrae l'esemplare reale */
  illustrative: boolean
  specialEdition: boolean
}

/** Ordine di presentazione: si passa dal passato al presente, poi al pezzo unico. */
export const CAR_CATEGORIES: readonly CarCategory[] = [
  {
    id: 'classiche',
    label: 'Classiche',
    eyebrow: 'Il tempo non le ha sfiorate',
    tagline: 'Icone che hanno scritto la storia dell’automobile.',
  },
  {
    id: 'supercar',
    label: 'Supercar',
    eyebrow: 'Quando la strada non basta',
    tagline: 'Purezza meccanica, senza filtri né compromessi.',
  },
  {
    id: 'suv',
    label: 'SUV',
    eyebrow: 'Nessun terreno è precluso',
    tagline: 'Prestazioni e versatilità, ovunque decidi di andare.',
  },
  {
    id: 'hypercar',
    label: 'Hypercar',
    eyebrow: 'Oltre il limite conosciuto',
    tagline: 'Il vertice assoluto dell’ingegneria contemporanea.',
  },
  {
    id: 'utilitarie',
    label: 'Utilitarie',
    eyebrow: 'La città, alle tue condizioni',
    tagline: 'Agili, efficienti e pensate per ogni giorno.',
  },
  {
    id: 'special',
    label: 'Special Edition',
    eyebrow: 'Un solo esemplare',
    tagline: 'Pezzi unici destinati a diventare leggenda.',
  },
]

interface CatalogEntry {
  brands: readonly string[]
  models: readonly string[]
  category: CarCategoryId
  anno: string
  claim: string
  specs: CarSpecs
  strengths: readonly string[]
  images: readonly CarColorImage[]
  specialEdition?: boolean
}

const photo = (filename: string, label = 'Colore in foto', color = '#7b8584'): CarColorImage => ({
  label,
  color,
  src: `/images/cars/${filename}.webp`,
})

const catalogue: readonly CatalogEntry[] = [
  // ---------------------------------------------------------------- CLASSICHE
  {
    brands: ['ford'],
    models: ['mustang1965', 'mustang1964', 'mustang1966', 'mustang67', 'mustangclassica'],
    category: 'classiche',
    anno: '1964 – 1966',
    claim: 'Il rombo che ha definito un’epoca.',
    specs: {
      motore: 'V8 4.7L (289 cu in) aspirato',
      potenza: '200 – 225 CV',
      coppia: '380 Nm',
      accelerazione: '8,5 s (0–100 km/h)',
      velocita: '185 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale 4 marce o automatico Cruise-O-Matic 3 marce',
    },
    strengths: [
      'Design senza tempo riconosciuto in tutto il mondo',
      'Meccanica semplice, robusta ed economica da mantenere',
      'Reperibilità dei ricambi pressoché infinita',
      'Eccellente tenuta del valore nel tempo',
    ],
    images: [photo('mustang67-rossa', 'Rosso', '#9e3637'), photo('mustang67-nera', 'Nero', '#343335')],
  },
  {
    brands: ['porsche'],
    models: ['911primaserie', '9111963', '901', '911classica', 'porsche1991'],
    category: 'classiche',
    anno: '1963',
    claim: 'Il punto zero di una leggenda lunga sessant’anni.',
    specs: {
      motore: 'Boxer 6 cilindri 2.0L raffreddato ad aria',
      potenza: '130 CV a 6.100 giri',
      coppia: '174 Nm a 4.200 giri',
      accelerazione: '8,7 s (0–100 km/h)',
      velocita: '210 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale a 5 marce',
    },
    strengths: [
      'Valore collezionistico di rilevanza mondiale',
      'Il sound inconfondibile del boxer raffreddato ad aria',
      'Qualità costruttiva e ingegneristica di prim’ordine',
      'Esperienza di guida analogica e gratificante',
    ],
    images: [photo('porsche1991', 'Verde', '#40594e')],
  },
  {
    brands: ['alfa'],
    models: ['2000spidertouring', '2000spider', 'spidertouring', 'anni40'],
    category: 'classiche',
    anno: '1958',
    claim: 'La Dolce Vita, carrozzata Touring Superleggera.',
    specs: {
      motore: '4 cilindri in linea 2.0L (1.975 cc) bialbero',
      potenza: '115 CV a 5.700 giri',
      coppia: '152 Nm',
      accelerazione: '12,0 s (0–100 km/h)',
      velocita: '180 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale a 5 marce',
    },
    strengths: [
      'Carrozzeria d’autore firmata Touring Superleggera',
      'Comfort di marcia elevato per una spider d’epoca',
      'Bialbero Alfa Romeo fluido e brillante',
      'Eleganza garantita a ogni raduno d’auto storiche',
    ],
    images: [photo('alfaromeoanni40', 'Ocra', '#d4ab52')],
  },
  {
    brands: ['fiat'],
    models: ['nuova500primaserie', '500primaserie', '5001957', '500anni50', 'fiatanni50'],
    category: 'classiche',
    anno: '1957',
    claim: 'Il capolavoro che ha messo su ruote l’Italia.',
    specs: {
      motore: '2 cilindri paralleli 479 cc raffreddato ad aria',
      potenza: '13 – 15 CV',
      coppia: '27 Nm',
      accelerazione: 'Non rilevata, progettata per la città',
      velocita: '85 – 90 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale a 4 marce',
    },
    strengths: [
      'Costi di gestione e manutenzione minimi',
      'Dimensioni ultracompatte e tetto in tela apribile',
      'Simbolo culturale di livello internazionale',
      'Ricambi facili da trovare e community vastissima',
    ],
    images: [photo('fiatanni50', 'Verde', '#627757')],
  },
  {
    brands: ['chevrolet'],
    models: ['belair1957', 'belair', '1957', 'chevrolet57'],
    category: 'classiche',
    anno: '1957',
    claim: 'Cromature, pinne e rock and roll.',
    specs: {
      motore: 'V8 Small Block 4.6L (283 cu in)',
      potenza: '185 – 283 CV',
      coppia: '390 Nm',
      accelerazione: '8,9 s (0–100 km/h)',
      velocita: '175 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale 3 marce o automatico Powerglide 2 marce',
    },
    strengths: [
      'Stile anni Cinquanta con pinne e dettagli cromati unici',
      'Abitacolo comodo per sei persone',
      'Il celebre V8 Small Block, affidabile e dal suono pieno',
      'Forte impatto visivo in qualsiasi contesto',
    ],
    images: [photo('chevrolet57', 'Verde', '#70aa4b')],
  },

  // ---------------------------------------------------------------- SUPERCAR
  {
    brands: ['lamborghini'],
    models: ['countachlp400', 'countach'],
    category: 'supercar',
    anno: '1974',
    claim: 'Il cuneo di Gandini che ha riscritto le regole.',
    specs: {
      motore: 'V12 a 60° 3.9L aspirato, sei carburatori Weber',
      potenza: '375 CV a 8.000 giri',
      coppia: '361 Nm a 5.500 giri',
      accelerazione: '5,4 s (0–100 km/h)',
      velocita: '309 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale a 5 marce',
    },
    strengths: [
      'Design a cuneo rivoluzionario, entrato nella storia',
      'Urlo inconfondibile del V12 aspirato a carburatori',
      'Portiere con apertura a forbice iconiche',
      'Oggetto da collezione di altissimo pregio',
    ],
    images: [photo('countach', 'Bianco', '#e0d7c8')],
  },
  {
    brands: ['ferrari'],
    models: ['f40'],
    category: 'supercar',
    anno: '1987',
    claim: 'L’ultima Ferrari firmata da Enzo.',
    specs: {
      motore: 'V8 a 90° 2.9L biturbo IHI',
      potenza: '478 CV a 7.000 giri',
      coppia: '577 Nm a 4.000 giri',
      accelerazione: '4,1 s (0–100 km/h) · 11,0 s sui 200',
      velocita: '324 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale a 5 marce con griglia in alluminio a vista',
    },
    strengths: [
      'Guida analogica pura, senza aiuti elettronici',
      'Struttura ultraleggera: 1.100 kg a secco',
      'Tra i valori collezionistici più alti al mondo',
      'L’ultima vettura approvata da Enzo Ferrari in persona',
    ],
    images: [photo('f40', 'Rosso', '#b8322e')],
  },
  {
    brands: ['mclaren'],
    models: ['f1'],
    category: 'supercar',
    anno: '1992',
    claim: 'Tre posti, guida centrale, record ancora imbattuto.',
    specs: {
      motore: 'V12 a 60° aspirato 6.1L BMW S70/2',
      potenza: '627 CV a 7.400 giri',
      coppia: '650 Nm a 5.600 giri',
      accelerazione: '3,2 s (0–100 km/h)',
      velocita: '386 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale a 6 marce',
    },
    strengths: [
      'Posizione di guida centrale d’ispirazione Formula 1',
      'Monoscocca in fibra di carbonio all’avanguardia',
      'V12 aspirato capolavoro di reattività',
      'Esclusività e valore collezionistico stratosferici',
    ],
    images: [photo('mclaren', 'Giallo', '#c4912d')],
  },
  {
    brands: ['bugatti'],
    models: ['veyron164', 'veyron2015', 'veyron'],
    category: 'supercar',
    anno: '2005',
    claim: 'Mille cavalli, quattrocento orari, nessun compromesso.',
    specs: {
      motore: 'W16 8.0L quad-turbo',
      potenza: '1.001 CV a 6.000 giri',
      coppia: '1.250 Nm da 2.200 a 5.500 giri',
      accelerazione: '2,5 s (0–100 km/h)',
      velocita: '407 km/h',
      trazione: 'Integrale permanente',
      cambio: 'Doppia frizione DSG a 7 rapporti',
    },
    strengths: [
      'Primo W16 quad-turbo della storia dell’automobile',
      'Stabilità eccezionale anche oltre i 400 km/h',
      'Interni in materiali pregiati, lusso artigianale',
      'Simbolo assoluto di prestigio tecnologico',
    ],
    images: [photo('veyron2015', 'Blu', '#2e75a4')],
  },
  {
    brands: ['porsche'],
    models: ['carreragt'],
    category: 'supercar',
    anno: '2003',
    claim: 'Un V10 da Le Mans e un pomello in faggio.',
    specs: {
      motore: 'V10 a 68° aspirato 5.7L',
      potenza: '612 CV a 8.000 giri',
      coppia: '590 Nm a 5.750 giri',
      accelerazione: '3,9 s (0–100 km/h)',
      velocita: '330 km/h',
      trazione: 'Posteriore',
      cambio: 'Manuale a 6 marce con frizione ceramica PCCC',
    },
    strengths: [
      'Suono del V10 aspirato unico e da brivido',
      'Monoscocca in fibra di carbonio derivata dalle corse',
      'Cambio manuale purissimo, pomello in legno omaggio alla 917',
      'Forte rivalutazione e alta richiesta internazionale',
    ],
    images: [photo('carreragt', 'Nero', '#353537')],
  },

  // ---------------------------------------------------------------- SUV
  {
    brands: ['lamborghini'],
    models: ['urus'],
    category: 'suv',
    anno: '2018',
    claim: 'Sant’Agata Bolognese, con cinque posti.',
    specs: {
      motore: 'V8 4.0L biturbo',
      potenza: '650 CV a 6.000 giri',
      coppia: '850 Nm da 2.250 a 4.500 giri',
      accelerazione: '3,6 s (0–100 km/h)',
      velocita: '305 km/h',
      trazione: 'Integrale con Torsen centrale e torque vectoring',
      cambio: 'Automatico a 8 rapporti',
    },
    strengths: [
      'Prestazioni da supercar in formato quotidiano',
      'Asse posteriore sterzante per una maneggevolezza eccezionale',
      'Design affilato e inconfondibilmente Lamborghini',
      'Altissima tenuta del valore nell’usato premium',
    ],
    images: [photo('urus', 'Arancio', '#da7238')],
  },
  {
    brands: ['landrover'],
    models: ['defender110', 'defender90', 'defender'],
    category: 'suv',
    anno: '2020',
    claim: 'La leggenda off-road, reinventata.',
    specs: {
      motore: '6 cilindri in linea 3.0L turbo mild-hybrid',
      potenza: '400 CV a 5.500 giri',
      coppia: '550 Nm da 2.000 a 5.000 giri',
      accelerazione: '6,1 s (0–100 km/h)',
      velocita: '209 km/h',
      trazione: 'Integrale permanente con Terrain Response 2',
      cambio: 'Automatico ZF a 8 rapporti',
    },
    strengths: [
      'Capacità fuoristradistiche di riferimento nel settore',
      'Interni robusti, lavabili, spaziosi ed eleganti',
      'Capacità di traino fino a 3.500 kg',
      'Stile neo-retro di grande impatto',
    ],
    images: [photo('defender', 'Grigio', '#827767')],
  },
  {
    brands: ['ferrari'],
    models: ['purosangue'],
    category: 'suv',
    anno: '2022',
    claim: 'L’unico al mondo con un V12 aspirato.',
    specs: {
      motore: 'V12 a 65° aspirato 6.5L',
      potenza: '725 CV a 7.750 giri',
      coppia: '716 Nm a 6.250 giri',
      accelerazione: '3,3 s (0–100 km/h)',
      velocita: '310 km/h',
      trazione: 'Integrale 4RM-S EVO',
      cambio: 'Doppia frizione a 8 rapporti',
    },
    strengths: [
      'Unico SUV al mondo con motore V12 aspirato',
      'Sospensioni attive con attuatori elettrici da tracciato',
      'Porte posteriori controvento, le Welcome Doors',
      'Esclusività assoluta e produzione limitata',
    ],
    images: [photo('purosangue', 'Rosso', '#933538')],
  },
  {
    brands: ['tesla'],
    models: ['modelxplaid', 'modelx', 'modelsuv'],
    category: 'suv',
    anno: '2015 – restyling',
    claim: 'Mille cavalli elettrici e ali di falco.',
    specs: {
      motore: 'Tre motori elettrici: uno anteriore, due posteriori',
      potenza: '1.020 CV complessivi',
      coppia: 'Oltre 1.000 Nm istantanei',
      accelerazione: '2,6 s (0–100 km/h)',
      velocita: '262 km/h',
      trazione: 'Integrale All-Wheel Drive',
      cambio: 'Riduttore a rapporto fisso · 543 km di autonomia WLTP',
    },
    strengths: [
      'Portiere posteriori Falcon Wing scenografiche e funzionali',
      'Accelerazione in grado di battere quasi ogni supercar',
      'Rete di ricarica proprietaria Supercharger',
      'Aggiornamenti software over-the-air continui',
    ],
    images: [photo('teslasuv', 'Viola', '#6c507e')],
  },
  {
    brands: ['ford'],
    models: ['bronco'],
    category: 'suv',
    anno: '2021',
    claim: 'Porte e tetto via, e si parte.',
    specs: {
      motore: 'V6 2.7L biturbo EcoBoost',
      potenza: '335 CV',
      coppia: '563 Nm a 3.100 giri',
      accelerazione: '6,9 s (0–100 km/h)',
      velocita: '161 km/h, limitata per uso off-road',
      trazione: 'Integrale inseribile con ridotte e modalità G.O.A.T.',
      cambio: 'Automatico a 10 rapporti',
    },
    strengths: [
      'Tetto e portiere completamente removibili',
      'Selettore G.O.A.T., Goes Over Any Type of Terrain',
      'Design ispirato alla prima generazione degli anni Sessanta',
      'Grande manovrabilità su roccia, sabbia e fango',
    ],
    images: [photo('bronco', 'Blu', '#315b79')],
  },

  // ---------------------------------------------------------------- HYPERCAR
  {
    brands: ['bugatti'],
    models: ['chiron', 'bugatticlassica', 'classica'],
    category: 'hypercar',
    anno: '2016',
    claim: 'Millecinquecento cavalli, limitata a 420 all’ora.',
    specs: {
      motore: 'W16 8.0L quad-turbo con sovralimentazione a due stadi',
      potenza: '1.500 CV a 6.700 giri',
      coppia: '1.600 Nm da 2.000 a 6.000 giri',
      accelerazione: '2,4 s (0–100 km/h) · 6,5 s sui 200',
      velocita: '420 km/h, elettronicamente limitata',
      trazione: 'Integrale',
      cambio: 'Doppia frizione a 7 rapporti',
    },
    strengths: [
      'Riserva di potenza senza pari nell’industria',
      'Interni realizzati a mano con pelli e metalli pregiati',
      'Silenziosa alle basse velocità, devastante in allungo',
      'Status symbol mondiale definitivo',
    ],
    images: [photo('bugatticlassica', 'Blu', '#4a86ac')],
  },
  {
    brands: ['ferrari'],
    models: ['laferrari'],
    category: 'hypercar',
    anno: '2013',
    claim: 'V12 e KERS: la Formula 1 su strada.',
    specs: {
      motore: 'V12 6.5L da 800 CV più motore elettrico HY-KERS da 163 CV',
      potenza: '963 CV complessivi',
      coppia: 'Oltre 900 Nm',
      accelerazione: 'Meno di 2,9 s (0–100 km/h)',
      velocita: 'Oltre 350 km/h',
      trazione: 'Posteriore',
      cambio: 'Doppia frizione F1 a 7 rapporti',
    },
    strengths: [
      'Tecnologia HY-KERS sviluppata sui tracciati di Formula 1',
      'Estetica firmata dal Centro Stile Ferrari',
      'Risposta all’acceleratore istantanea',
      'Valore da asta da record globale',
    ],
    images: [photo('ferrari-laferrari', 'Rosso', '#a72b2b')],
  },
  {
    brands: ['porsche'],
    models: ['918spyder', 'spyder918'],
    category: 'hypercar',
    anno: '2013',
    claim: 'Ibrida plug-in che ha domato il Nürburgring.',
    specs: {
      motore: 'V8 4.6L aspirato da 608 CV più due motori elettrici da 286 CV',
      potenza: '887 CV complessivi',
      coppia: '1.280 Nm',
      accelerazione: '2,6 s (0–100 km/h)',
      velocita: '345 km/h',
      trazione: 'Integrale elettrica eAWD',
      cambio: 'Doppia frizione PDK a 7 rapporti',
    },
    strengths: [
      'Scarichi rivolti verso l’alto per una colonna sonora unica',
      'Trazione integrale fulminea e guidabilità facilissima',
      'Tetto targa in carbonio asportabile in due pezzi',
      'Guida completamente elettrica nell’uso urbano',
    ],
    images: [photo('spyder918', 'Argento', '#8d8981')],
  },
  {
    brands: ['koenigsegg'],
    models: ['jesko'],
    category: 'hypercar',
    anno: '2019',
    claim: 'Nove marce, sette frizioni, nessun tempo morto.',
    specs: {
      motore: 'V8 5.0L biturbo con albero motore piatto',
      potenza: '1.280 CV a benzina · 1.600 CV con bioetanolo E85',
      coppia: '1.500 Nm a 5.100 giri',
      accelerazione: '2,5 s (0–100 km/h)',
      velocita: 'Progettata per superare i 480 km/h nella versione Absolut',
      trazione: 'Posteriore',
      cambio: 'Light Speed Transmission a 9 rapporti',
    },
    strengths: [
      'Cambio LST brevettato, il più rapido al mondo',
      'Oltre 1.400 kg di deportanza alle alte velocità',
      'Rapporto peso potenza impressionante',
      'Soluzioni ingegneristiche uniche firmate von Koenigsegg',
    ],
    images: [photo('jesko', 'Oro', '#b19a62')],
  },
  {
    brands: ['astonmartin'],
    models: ['valkyrie'],
    category: 'hypercar',
    anno: '2021',
    claim: 'Undicimila giri, e la targa dietro.',
    specs: {
      motore: 'V12 6.5L aspirato Cosworth da 1.000 CV più sistema Rimac da 160 CV',
      potenza: '1.160 CV a 10.500 giri',
      coppia: '900 Nm a 6.000 giri',
      accelerazione: '2,5 s (0–100 km/h)',
      velocita: 'Oltre 350 km/h',
      trazione: 'Posteriore',
      cambio: 'Sequenziale Ricardo a 7 rapporti',
    },
    strengths: [
      'V12 Cosworth che sale fino a 11.100 giri al minuto',
      'Aerodinamica a effetto suolo firmata Adrian Newey',
      'Struttura integralmente in fibra di carbonio',
      'L’esperienza più vicina in assoluto a una monoposto',
    ],
    images: [photo('valkyrie', 'Grigio', '#777b7a')],
  },

  // ---------------------------------------------------------------- UTILITARIE
  {
    brands: ['fiat'],
    models: ['500e', '500elettrica', '500hybrid', '500electric'],
    category: 'utilitarie',
    anno: '2020',
    claim: 'Trecentoventi chilometri, zero emissioni.',
    specs: {
      motore: 'Elettrico da 87 kW con batteria da 42 kWh',
      potenza: '118 CV',
      coppia: '220 Nm',
      accelerazione: '9,0 s (0–100 km/h)',
      velocita: '150 km/h',
      trazione: 'Anteriore',
      cambio: 'Rapporto fisso · 320 km di autonomia WLTP',
    },
    strengths: [
      'Dimensioni compatte ideali per la mobilità urbana',
      'Design iconico italiano premiato a livello internazionale',
      'Costi di esercizio e consumi estremamente ridotti',
      'Ricarica rapida fino a 85 kW',
    ],
    images: [photo('500-elettrica', 'Azzurro', '#5f8496')],
  },
  {
    brands: ['toyota'],
    models: ['yarishybrid', 'yaris'],
    category: 'utilitarie',
    anno: '2020',
    claim: 'Auto dell’Anno 2021, e si vede.',
    specs: {
      motore: '1.5L tre cilindri benzina più motore elettrico, full hybrid',
      potenza: '116 CV complessivi',
      coppia: '141 Nm',
      accelerazione: '9,7 s (0–100 km/h)',
      velocita: '175 km/h',
      trazione: 'Anteriore',
      cambio: 'Automatico e-CVT',
    },
    strengths: [
      'Consumi record in ciclo urbano',
      'Leggendaria affidabilità meccanica Toyota',
      'Ricca dotazione di sistemi ADAS di serie',
      'Ottimo raggio di sterzata per manovre veloci',
    ],
    images: [photo('yaris', 'Argento', '#a0a5a2')],
  },
  {
    brands: ['citroen'],
    models: ['c3aircross', 'ec3', 'c3'],
    category: 'utilitarie',
    anno: '2024',
    claim: 'Il comfort Citroën, alla portata di tutti.',
    specs: {
      motore: 'Elettrico da 83 kW oppure 1.2 turbo mild-hybrid',
      potenza: '113 CV elettrica · 100 CV mild-hybrid',
      coppia: '120 – 205 Nm',
      accelerazione: '11,0 s (0–100 km/h)',
      velocita: '135 km/h elettrica · 183 km/h benzina',
      trazione: 'Anteriore',
      cambio: 'Automatico · 320 km di autonomia WLTP',
    },
    strengths: [
      'Rapporto prezzo contenuti di primo livello',
      'Sospensioni con smorzatori idraulici progressivi',
      'Posizione di guida rialzata, visibilità ottimale',
      'Design fresco, colorato e personalizzabile',
    ],
    images: [photo('citroen', 'Grigio', '#8a9695')],
  },
  {
    brands: ['volkswagen', 'vw'],
    models: ['golfr', 'golf'],
    category: 'utilitarie',
    anno: '2024',
    claim: 'Trecentotrentatré cavalli, cinque porte.',
    specs: {
      motore: '4 cilindri 2.0L turbo benzina TSI EA888',
      potenza: '333 CV da 5.600 a 6.500 giri',
      coppia: '420 Nm da 2.100 a 5.500 giri',
      accelerazione: '4,6 s (0–100 km/h)',
      velocita: '250 km/h · 270 con pacchetto R-Performance',
      trazione: 'Integrale 4MOTION con torque vectoring posteriore',
      cambio: 'Doppia frizione DSG a 7 rapporti',
    },
    strengths: [
      'Sintesi perfetta tra uso quotidiano e prestazioni',
      'Trazione integrale con ripartizione sulle singole ruote',
      'Infotainment rinnovato, veloce e intuitivo',
      'Tenuta di strada granitica in ogni condizione',
    ],
    images: [photo('golf', 'Blu', '#3b597f')],
  },

  // ---------------------------------------------------------------- SPECIAL EDITION
  // L'allestimento uno di uno va confrontato per primo: il modello standard è una sua sottostringa.
  {
    brands: ['ford', 'shelby'],
    models: ['mustangshelbygt500extreme', 'shelbygt500extreme', 'gt500extreme', 'gt5001su1'],
    category: 'special',
    anno: '2020',
    claim: 'Uno di uno. Non ne esiste un secondo.',
    specs: {
      motore: 'V8 5.2L sovralimentato con compressore volumetrico Eaton da 2.65L',
      potenza: '770 CV a 7.300 giri',
      coppia: '847 Nm a 5.000 giri',
      accelerazione: '3,5 s (0–100 km/h) · quarto di miglio sotto gli 11 s',
      velocita: '290 km/h, limitata per massimo carico aerodinamico',
      trazione: 'Posteriore con differenziale Torsen autobloccante',
      cambio: 'Doppia frizione TREMEC a 7 rapporti, cambiate in 100 ms',
    },
    strengths: [
      'V8 Predator assemblato a mano con compressore volumetrico',
      'Cambio TREMEC derivato dal programma Ford GT',
      'Impianto Brembo maggiorato e pacchetto Carbon Fiber Track',
      'Esemplare unico con quotazione d’élite',
    ],
    images: [photo('shelbygt500-extreme', 'Blu notte', '#1d3458')],
    specialEdition: true,
  },
  {
    brands: ['ford', 'shelby'],
    models: ['mustangshelbygt500', 'shelbygt500', 'gt500'],
    category: 'special',
    anno: '2020',
    claim: 'Il V8 Predator, assemblato a mano.',
    specs: {
      motore: 'V8 5.2L sovralimentato con compressore volumetrico Eaton da 2.65L',
      potenza: '770 CV a 7.300 giri',
      coppia: '847 Nm a 5.000 giri',
      accelerazione: '3,5 s (0–100 km/h)',
      velocita: '290 km/h, limitata per massimo carico aerodinamico',
      trazione: 'Posteriore con differenziale Torsen autobloccante',
      cambio: 'Doppia frizione TREMEC a 7 rapporti',
    },
    strengths: [
      'La Mustang di serie più potente mai costruita da Ford',
      'Cambio doppia frizione fulmineo derivato dal Ford GT',
      'Impianto frenante Brembo sovradimensionato',
      'Forte richiesta sul mercato del collezionismo moderno',
    ],
    images: [photo('shelby-nera', 'Nero', '#353b40')],
  },
]

const fallback: CarProfile = {
  category: 'supercar',
  anno: '—',
  claim: 'Una storia ancora da scrivere.',
  specs: {
    motore: 'Da definire',
    potenza: 'Da definire',
    coppia: 'Da definire',
    accelerazione: 'Da definire',
    velocita: 'Da definire',
    trazione: 'Da definire',
    cambio: 'Da definire',
  },
  strengths: [],
  images: [{ label: 'Immagine illustrativa', color: '#6b8585', src: '/images/editorial-suv.png' }],
  illustrative: true,
  specialEdition: false,
}

/** Riduce marca e modello a lettere e numeri, così il confronto ignora accenti e punteggiatura. */
function compact(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findEntry(brand: string, model: string): CatalogEntry | undefined {
  const brandMatches = (entry: CatalogEntry) => entry.brands.some((name) => brand.includes(name))

  // Prima la corrispondenza esatta del modello: evita che "Shelby GT500" catturi la variante Extreme
  return catalogue.find((entry) => brandMatches(entry) && entry.models.includes(model))
    ?? catalogue.find((entry) => brandMatches(entry) && entry.models.some((name) => model.includes(name)))
}

export function getCarProfile(car: Pick<CarView, 'marca' | 'modello'>): CarProfile {
  const entry = findEntry(compact(car.marca), compact(car.modello))
  if (!entry) return fallback

  return {
    category: entry.category,
    anno: entry.anno,
    claim: entry.claim,
    specs: entry.specs,
    strengths: entry.strengths,
    images: entry.images,
    illustrative: false,
    specialEdition: entry.specialEdition ?? false,
  }
}

export function getCategory(id: CarCategoryId): CarCategory {
  return CAR_CATEGORIES.find((category) => category.id === id) ?? CAR_CATEGORIES[0]
}

/** Etichette delle specifiche, nell'ordine in cui vanno mostrate. */
export const SPEC_LABELS: readonly { key: keyof CarSpecs; label: string }[] = [
  { key: 'motore', label: 'Motore' },
  { key: 'potenza', label: 'Potenza' },
  { key: 'coppia', label: 'Coppia' },
  { key: 'accelerazione', label: 'Accelerazione' },
  { key: 'velocita', label: 'Velocità massima' },
  { key: 'trazione', label: 'Trazione' },
  { key: 'cambio', label: 'Cambio' },
]
