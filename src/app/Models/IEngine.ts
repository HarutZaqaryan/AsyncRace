import { ICars } from './ICars';

export interface IEngine extends ICars {
  velocity: number;
  distance: number;
}
