import type {
  Department,
  Publication,
  QuizElementType,
  ToolType,
} from './enums';
import type { QuizQuestionId, StatisticViewKey } from './types';

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

export interface QuizBaseQuestion {
  articleRecommendations: ArticleRecommendation[];
  id: string;
  question: string;
  type: QuizElementType;
  image?: QuizImage;
  introduction?: string;
  notes?: string;
}

export interface Cover {
  id: QuizQuestionId;
  type: QuizElementType.Cover;
  title: string;
}

export interface QuizSubtitleElement {
  questionSubTitle: string;
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

export interface NumberPoll extends SliderQuestion, QuizSubtitleElement {
  type: QuizElementType.NumberPoll;
}

export interface NumberGuess extends SliderQuestion {
  type: QuizElementType.NumberGuess;
  answer: number;
  answerText: string;
  unit: string;
}

export interface LastCard {
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

export interface CoverElement {
  id: QuizQuestionId;
  type: QuizElementType.Cover;
  title: string;
}

export interface LastCardElement {
  id: QuizQuestionId;
  type: QuizElementType.LastCard;
  title: string;
  isFinalScoreShown: boolean;
  articleRecommendations?: ArticleRecommendations[];
  text: string;
  quizLink: string;
  quizTitle: string;
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
  numberPoll: number;
}

export interface AnswerNumberOption {
  key?: string;
  reduce?: boolean;
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
  value: DBAnswerMapPointGuessValue | string;
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
  mapConfigurtaion: MapConfiguration;
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
