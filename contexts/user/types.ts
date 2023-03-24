import { ApolloError } from "@apollo/client";
import { User as AuthUser } from "@auth0/auth0-react";
import { Location } from "dx-sdk/build/services/location/types";
import { User } from "dx-sdk/build/services/user/types";
import { Patch } from "dx-sdk/build/services/user/patchProfile/types";
export interface UserProviderProps {
  children?: React.ReactNode;
}
import { Feature } from "dx-sdk/build/services/features/types";
import { AddFeature } from "dx-sdk/build/services/user/addFeature/types";
import { RemoveFeature } from "dx-sdk/build/services/user/removeFeature/types";
import { Patch as UserPatch } from "dx-sdk/build/services/user/patch/types";
import { Mark } from "dx-sdk/build/services/user/markContentComplete/types";
import { Mark as Unmark } from "dx-sdk/build/services/user/markContentIncomplete/types";

export interface MarketingMeta {
  OriginWebURL?: string;
  OriginWebApp?: string;
  OriginWebPageType?: string;
  OriginWebFormType?: string;
  OriginWebFormCategory?: string;
  OriginWebCampaign?: string;
  UtmSource?: string;
  UtmMedium?: string;
  UtmCampaign?: string;
  UtmTerm?: string;
  UtmContent?: string;
  GAClientId?: string;
  PubWebLeadId?: string;
  DXClientId?: string;
  GoogleClickId?: string;
  BingClickId?: string;
  FacebookClickId?: string;
}

export interface UserProviderValue {
  user: null | User;
  authUser: null | AuthUser;
  token: null | string;
  location: null | Location;
  features: null | Feature[];
  favorites: string[];
  distance: number;
  zipcode: string;
  marketingMeta: MarketingMeta;
  actions?: {
    updateZipcode: UpdateZipcode;
    updateDistance: UpdateDistance;
    patchProfile: Patch;
    addFeature: AddFeature;
    removeFeature: RemoveFeature;
    patch: UserPatch;
    markContentComplete: Mark;
    markContentIncomplete: Unmark;
    maybeMarkContentComplete: (key: string) => void;
    toggleFavorite: (modelNumber: string, collectionId?: number) => void;
  };
  loading: boolean;
  error?: ApolloError;
}

export type UpdateZipcode = (zipcode: string) => void;

export type UpdateDistance = (distance: number) => void;

declare global {
  interface Window {
    ga: any;
  }
}
