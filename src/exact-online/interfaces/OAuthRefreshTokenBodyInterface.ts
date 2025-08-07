import { OAuthBodyInterface } from './OAuthBodyInterface';

export interface OAuthRefreshTokenBodyInterface extends OAuthBodyInterface {
  refresh_token: string;
  grant_type: string;
  [key: string]: string;
}
