import type { Writable } from 'svelte/store';
import type {
  Department,
  Publication,
  QuizElementType,
  ToolType,
} from './enums';
import type {
  MapPointGuessStatisticViewKey,
  QuizQuestionId,
  StatisticViewKey,
} from './types';

export interface QDoc {
  _id?: string;
  _rev?: string;
  acronym?: string;
  active?: boolean;
  activateDate?: string; // ex.: 2017-02-14T08:01:48.108Z
  createdDate: string; // ex.: 2018-04-12T12:40:58.438Z
  createdBy: string; // ex.: user.name@nzz.ch
  deactivateDate?: string; // ex.: 2018-04-12T12:40:58.438Z
  department: Department;
  notes?: string;
  publication: Publication;
  sources?: Source[];
  subtitle?: string;
  title: string;
  tool: ToolType;
  updatedDate: string; // ex.: 2018-04-12T12:40:58.438Z
  updatedBy: string; // ex.: user.name@nzz.ch

  /**
   * New from Qv2
   * We will use this to keep track of at which version of the tool
   * the item was created / updated.
   */
  version?: string;

  // The following properties will be overwritten
  // by each unique implementation.
  options: unknown;

  trackingComponent?: TrackingComponent;
}

export interface Source {
  link: {
    url?: string;
    isValid?: boolean;
  };
  text: string;
}

export interface TrackingComponent {
  title: string;
  type: string;
  'Q:type': string;
  'Q:options': {
    placeholder: string;
    availabilityChecks: {
      type: string;
      config: {
        role: string;
      };
    };
  };
}

export interface QuizDoc extends QDoc {
  elements: QuizBaseQuestion[];
}

export interface QuizElements {
  questions: (MultipleChoice | MapPointGuess | NumberPoll | NumberGuess)[];
  cover?: Cover;
  lastCard?: LastCard;
  hasCover: boolean;
  hasLastCard: boolean;
  questionCount: number;
}

export interface QuizBaseQuestion extends BaseElement {
  articleRecommendations: ArticleRecommendation[];
  question: string;
  image?: QuizImage;
  introduction?: string;
  answerText?: string;
  userAnswer?: UserAnswer;
  questionSubTitle?: string;
  notes?: string;
}

export interface UserAnswer {
  answer?: string | number | AnswerGeoData;
  isCorrect: boolean;
}

export interface QuizStoreContext {
  quizStore: QuizStoreFn;
  questionContainerStore: Writable<HTMLDivElement | undefined>;
}
export interface QuizStoreFn extends Writable<QuizStore> {
  initialize: (componentConfiguration: QQuizSvelteProperties) => void;
  stepForward: () => void;
  answerdQuestion: (
    qItemId: string,
    element: MultipleChoice | SliderQuestion | MapPointGuess,
    answer: DBAnswerMapPointGuessValue | string | number
  ) => Promise<void>;
  isAnswered: () => boolean;
}

export interface QuizStore {
  qItemId: string;
  items: ElementItemStore[];
  isMultiQuiz: boolean;
  hasCover: boolean;
  hasLastCard: boolean;
  hasScore: boolean;
  step: number;
  numberQuestions: number;
  configuration: {
    imageServiceUrl: string;
    enrico: Enrico;
    mapConfiguration: MapConfiguration;
    toolBaseUrl: string;
  };
}

export interface ElementItemStore {
  item:
    | Cover
    | MultipleChoice
    | MapPointGuess
    | NumberPoll
    | NumberGuess
    | LastCard;
  isAnswered: boolean;
  isLastQuizElement: boolean;
  progressIndex: number;
}

export interface BaseElement {
  id: QuizQuestionId;
  type: QuizElementType;
}

export interface Cover extends BaseElement {
  type: QuizElementType.Cover;
  title: string;
  themeTitle?: string;
  image?: QuizImage;
  color?: string;
}

export interface MultipleChoice extends QuizBaseQuestion {
  type: QuizElementType.MultipleChoice;
  answer: string;
  choices: string[];
  wrongAnswerText: string[];
}

export interface MapPointGuess extends QuizBaseQuestion {
  type: QuizElementType.MapPointGuess;
  answer: MapPointGuessAnswer;
}

export interface MapPointGuessAnswer {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    pointLabel: string;
  };
  bbox: [number, number, number, number];
}
export interface SliderQuestion extends QuizBaseQuestion {
  max: number;
  min: number;
  step: number;
  unit: string;
  unit_sinpular: string;
}

export interface NumberPoll extends SliderQuestion {
  type: QuizElementType.NumberPoll;
}

export interface NumberGuess extends SliderQuestion {
  type: QuizElementType.NumberGuess;
  answer: number;
  unit: string;
}

export interface LastCard extends BaseElement {
  id: QuizQuestionId;
  type: QuizElementType.LastCard;
  title: string;
  isFinalScoreShown: boolean;
  quizLink?: string;
  quizTitle?: string;
  text?: string;
  articleRecommendations?: ArticleRecommendation[];
}

export interface QuizImage {
  height?: number;
  key?: string;
  size?: number;
  url?: string;
  width?: number;
}

export interface ArticleRecommendation {
  articleId: string;
  text: string;
}

export interface Statistic {
  totalAnswers: number;
  betterThanPercentage?: number;
  betterThanCount?: number;
  diffPercentage?: number;
  numberOfSameAnswers?: number;
  numberOfAnswersPerChoice?: NumberOfAnswersPerChoice[];
}

export interface NumberOfAnswersPerChoice {
  key: string;
  value: number;
}

export interface WebPayload {
  item: QuizDoc;
  itemStateInDb: boolean;
  toolRuntimeConfig: ToolRuntimeConfig;
}

export interface DisplayOptions {
  hideTitle?: boolean;
}

export interface ToolRuntimeConfig {
  displayOptions?: DisplayOptions;
  fileRequestBaseUrl: string;
  toolBaseUrl: string;
  id: string;
  size: ToolRuntimeConfigSize;
  isPure: boolean;
  requestId: string;
  markup?: string;
  noInteraction?: boolean;
}

export interface ToolRuntimeConfigSize {
  width: Array<{
    value: number;
    unit: string;
    comparison: '=' | '>' | '<' | '>=' | '<=';
  }>;
}

export interface RenderingInfo {
  polyfills: string[];
  stylesheets: Array<{ name: string }>;
  scripts: Array<{ content: string }>;
  markup: string;
}

export interface StyleHashMap {
  'q-quiz': string;
}

export interface QuizContext {
  item: QuizDoc;
  quizContainerId: string;
  imageServiceUrl: string;
  width?: number;
}

export interface ArticleRecommendations {
  text: string;
  articleId: string;
}

export interface Images {
  image1x: Image;
  image2x: Image;
  webp1x: Image;
  webp2x: Image;
}

export interface Image {
  key: string;
  urls: string;
  length: number;
  width: number;
  height: number;
}

export interface AnswerData {
  itemId: string;
  questionId: string;
  type: QuizElementType;
  value: number | string | AnswerGeoData;
}

export interface AnswerGeoData {
  latLng: Coordinate;
  distance: number;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

// export interface AnswerStatistic {
//   value: number;
//   count: number;
// }

export interface QuizeScore {
  maxScore: number;
  achievedScore: number;
  lastCardTitle?: string;
}

export interface Multiplicators {
  multipleChoice: number;
  numberGuess: number;
  mapPointGuess: number;
}

export interface AnswerNumberOption {
  key?: string;
  reduce?: boolean;
}

export interface ButtonColorStyle {
  Text: string;
  Background: string;
  Hover: string;
  Disabled: string;
}

// DB
export interface DBOptions {
  auth?: DBAuthOptions;
}

export interface DBAuthOptions {
  username: string;
  password: string;
}

export interface DBAnswerDoc {
  data: DBAnswerData;
  created_at: string;
}

export interface DBAnswerData {
  itemId: string;
  questionId: string;
  type: QuizElementType;
  value: DBAnswerMapPointGuessValue | string | number;
}

export interface DBAnswerMapPointGuessValue {
  latLng: Coordinate;
  distance: number;
}

export interface DBAnswerDataValue {}

export interface AnswerQueryOptions {
  start_key?: number[];
  end_key?: (number | {})[];
  group?: boolean;
}

export interface StatisticView {
  key: StatisticViewKey;
  value: number;
}

export interface MapPointGuessStatisticView {
  key: MapPointGuessStatisticViewKey;
  value: number;
}

export interface MapPointGuessStatistic {
  distance: number;
  latLng: Coordinate;
  count: number;
}

export // Backend
interface QQuizConfig {
  _id: string;
  title: string;
  notes: string;
  type?: string;
  data?: any;
}

export interface QQuizSvelteProperties {
  item: QuizElements; // To make renderingInfoScripts working. refactor later.
  config: QuizDoc;
  displayOptions: DisplayOptions;
  noInteraction: boolean;
  id: string;
  imageServiceUrl: string;
  enrico: Enrico;
  mapConfiguration: MapConfiguration;
  toolBaseUrl: string;
}

export interface Enrico {
  url: string;
  products: string[];
}

export interface MapConfiguration {
  styleUrl: string;
  attribution: string;
}
// enrico api
export interface Root {
  metadata: Metadata;
}

export interface Metadata {
  language: Language;
  title: string;
  nzzAuthors: NzzAuthor[];
  designName: string;
  exclude: Exclude;
  department: DepartmentLD;
  publicationDate: string;
  slug: string;
  firstPublicationDate: string;
  nzzCharacterCount: number;
  authorLine: string;
  lastProofreadRevision: number;
  indexedAt: string;
  numberOfContentComponents: number;
  designVersion: string;
  leadText: string;
  germanyRelevant: boolean;
  publicationLastUpdated: string;
  urlPath: string;
  nzzId: string;
  teaserImage: TeaserImage;
  url: string;
  dependencies: Dependencies;
  layout: string;
  embeds: Embeds;
  teaserCaption: string;
  breadcrumbs: Breadcrumb[];
  documentId: string;
  product: string;
}

export interface Language {
  label: string;
  locale: string;
}

export interface NzzAuthor {
  name: string;
  id: number;
}

export interface Exclude {
  app: boolean;
  amp: boolean;
}

export interface DepartmentLD {
  path: string;
  level: number;
  name: string;
}

export interface TeaserImage {
  imageService: string;
  width: number;
  originalUrl: string;
  crops: Crop[];
  url: string;
  height: number;
}

export interface Crop {
  name: string;
  x: number;
  width: number;
  y: number;
  url: string;
  height: number;
}

export interface Dependencies {
  js: J[];
}

export interface J {
  componentIds: string[];
  src: string;
  namespace: string;
}

export interface Embeds {
  images: Image[];
  q_embeds: QEmbed[];
  videos: any[];
}

export interface Image {
  caption: string;
  origins: Origin[];
  url: string;
}

export interface Origin {
  identifier: string;
  name: string;
}

export interface QEmbed {
  id: string;
}

export interface Breadcrumb {
  path: string;
  name: string;
}
