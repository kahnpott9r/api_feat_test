import { OAuthBodyInterface } from './OAuthBodyInterface';

export interface OAuthAuthorizationCodeBodyInterface
  extends OAuthBodyInterface {
  code: string;
  grant_type: string;
  redirect_uri: string;
  [key: string]: string;
}
