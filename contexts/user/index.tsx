import {
  useFeaturesService,
  useLocationService,
  useUserService,
} from 'dx-sdk/build/services';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import {
  UserProviderProps,
  UserProviderValue,
  UpdateZipcode,
  UpdateDistance,
  MarketingMeta,
} from './types';
import config from '@/utils/config';
import { useRouter } from 'next/router';

export const client = new ApolloClient({
  uri: config.GRAPHQL_MESH_URI,
  cache: new InMemoryCache(),
});

const initialState = {
  user: null,
  authUser: null,
  token: null,
  location: null,
  features: null,
  marketingMeta: {},
  loading: false,
  distance: 50,
  zipcode: '',
};

export const UserContext = createContext<UserProviderValue>(initialState);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [distance, setDistance] = useState(50);
  const [completeContent, setCompleteContent] = useState<string[]>([]);
  const { user, getAccessTokenSilently } = useAuth0();
  const [marketingMeta, setMarketingMeta] = useState({});

  const userService = useUserService({
    client,
    token,
    ...(user && {
      user: {
        identityProviderUserId: user?.sub,
        identityProviderId: 1,
        ...(user?.given_name && {
          firstName: user.given_name,
        }),
        ...(user?.first_name && {
          firstName: user.first_name,
        }),
        ...(user?.family_name && {
          lastName: user.family_name,
        }),
        ...(user?.last_name && {
          lastName: user.last_name,
        }),
      },
    }),
    profile: {
      profileType: 'corp',
    },
    include: {
      corpCollections: true,
      profile: true,
      plannerProgress: true,
    },
    plannerType: 'corp',
  });

  const locationService = useLocationService({
    client,
    ...(zipcode && { postalCode: zipcode }),
  });

  const featureService = useFeaturesService({
    client,
    token: token,
    condition: {
      type: 'corp',
    },
  });

  // get auth0 token
  useEffect(() => {
    if (user) {
      getAccessTokenSilently().then(setToken).catch(setError);
    }
  }, [user, error, getAccessTokenSilently]);

  // get zipcode from localStorage
  useEffect(() => {
    setZipcode(localStorage.getItem('zipcode') || '');
  }, []);

  // get distance from localStorage
  useEffect(() => {
    setDistance(parseInt(localStorage.getItem('distance') || '50', 10));
  }, []);

  // set zipcode in localStorage and profile on update
  useEffect(() => {
    if (zipcode) {
      const { likedFeatures, ...profile } = userService.data.profile || {
        likedFeatures: [],
        profileId: 0,
      };

      localStorage.setItem('zipcode', zipcode);

      if (profile && profile?.profileId) {
        userService.patchProfile({
          profile: {
            ...profile,
            profileId: profile?.profileId,
            profileType: 'corp',
            landZip: parseInt(zipcode),
          },
        });
      }
    }
  }, [zipcode]);

  // set distance in localStorage on update
  useEffect(() => {
    if (distance) {
      localStorage.setItem('distance', `${distance}`);
    }
  }, [zipcode]);

  // update zipcode on user update
  useEffect(() => {
    if (
      userService.data?.profile?.landZip &&
      `${userService.data?.profile?.landZip}` !== zipcode
    ) {
      setZipcode(`${userService.data?.profile?.landZip}`);
    }
  }, [userService]);

  // update completed contents on user update
  useEffect(() => {
    setCompleteContent(
      userService.data.plannerProgress?.reduce(
        (_complete: string[], section) => [
          ..._complete,
          ...section.completedContents,
        ],
        []
      ) || []
    );
  }, [userService.data]);

  // update marketing meta
  useEffect(() => {
    const localMarketingMeta = JSON.parse(
      `${localStorage.getItem('marketingMeta')}`
    );
    const gaTracker = window?.ga?.getAll()?.[0];

    const marketingMeta: MarketingMeta = {
      UtmSource:
        router.query?.utm_source ||
        sessionStorage.getItem('utm_source') ||
        localMarketingMeta?.UtmSource ||
        '',
      UtmMedium:
        router.query?.utm_medium ||
        sessionStorage.getItem('utm_medium') ||
        localMarketingMeta?.UtmMedium ||
        '',
      UtmCampaign:
        router.query?.utm_campaign ||
        sessionStorage.getItem('utm_campaign') ||
        localMarketingMeta?.UtmCampaign ||
        '',
      UtmTerm:
        router.query?.utm_term ||
        sessionStorage.getItem('utm_term') ||
        localMarketingMeta?.UtmTerm ||
        '',
      UtmContent:
        router.query?.utm_content ||
        sessionStorage.getItem('utm_content') ||
        localMarketingMeta?.UtmContent ||
        '',
      GAClientId: gaTracker?.get('clientId') || '',
      // DXClientId: user?.sub,
      GoogleClickId:
        router.query?.gclid ||
        sessionStorage.getItem('gclid') ||
        localMarketingMeta?.GoogleClickId ||
        '',
      BingClickId:
        router.query?.msclkid ||
        sessionStorage.getItem('msclkid') ||
        localMarketingMeta?.BingClickId ||
        '',
      FacebookClickId:
        router.query?.fbclid ||
        sessionStorage.getItem('fbclid') ||
        localMarketingMeta?.FacebookClickId ||
        '',
    };

    setMarketingMeta(marketingMeta);
    localStorage.setItem('marketingMeta', JSON.stringify(marketingMeta));
  }, [router.query, router.pathname, user?.sub]);

  const updateZipcode: UpdateZipcode = (zipcode) => {
    setZipcode(zipcode);
  };

  const updateDistance: UpdateDistance = (distance) => {
    setDistance(distance);
  };

  const maybeMarkContentComplete = (key: string) => {
    if (
      !userService.loading ||
      (userService.loading && completeContent.length)
    ) {
      const isMarked = completeContent.includes(key);

      if (!isMarked) {
        userService.markContentComplete({
          plannerType: 'corp',
          contentTag: key,
        });
        setCompleteContent([...completeContent, key]);
      }
    }
  };

  const value: UserProviderValue = {
    user: userService.data,
    authUser: user || null,
    token,
    location: locationService.data,
    features: featureService.data,
    marketingMeta,
    zipcode,
    distance,
    loading: userService.loading || locationService.loading,
    error: userService.error || locationService.error || featureService.error,
    actions: {
      updateZipcode,
      updateDistance,
      patchProfile: userService.patchProfile,
      addFeature: userService.addFeature,
      removeFeature: userService.removeFeature,
      patch: userService.patch,
      markContentComplete: userService.markContentComplete,
      markContentIncomplete: userService.markContentIncomplete,
      maybeMarkContentComplete,
    },
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserState = () => useContext(UserContext);
