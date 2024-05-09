import { LoginProps } from '@/utils/types';
import { useMagic } from '../MagicProvider';
import { useEffect, useState } from 'react';
import { saveUserInfo } from '@/utils/common';
import Spinner from '../../ui/Spinner';
import Image from 'next/image';
import google from 'public/social/Google.svg';
import Card from '../../ui/Card';
import CardHeader from '../../ui/CardHeader';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { firebaseAuth } from '../../firebase/config';

const Google = ({ token, setToken }: LoginProps) => {
  const { magic } = useMagic();
  const [isAuthLoading, setIsAuthLoading] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthLoading(localStorage.getItem('isAuthLoading'));
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await magic?.user.isLoggedIn();

      if (!isLoggedIn) return;
      try {
        if (magic) {
          const metadata = await magic?.user.getMetadata();

          if (!metadata?.publicAddress) return;
          setLoadingFlag('false');
        }
      } catch (e) {
        console.log('social login error: ' + e);
        setLoadingFlag('false');
      }
    };

    checkLogin();
  }, [magic, setToken]);

  const login = async () => {
    setLoadingFlag('true');
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(firebaseAuth, provider);

      if (!result || !result.user) {
        throw new Error('Google sign in failed');
      }

      // Retrieve ID token from google sign in result
      const accessToken = await result.user.getIdToken();

      const DID = await magic?.openid.loginWithOIDC({
        // this oidcToken comes from the identity provider
        jwt: accessToken,
        // this providerId is provided by Magic
        providerId: process.env.NEXT_PUBLIC_PROVIDER_ID ?? '',
      });

      const metadata = await magic?.user.getMetadata()

      setToken(DID ?? '');
      saveUserInfo(DID ?? '', 'SOCIAL', metadata?.publicAddress ?? '');

      console.log(metadata)
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const setLoadingFlag = (loading: string) => {
    localStorage.setItem('isAuthLoading', loading);
    setIsAuthLoading(loading);
  };

  return (
    <Card>
      <CardHeader id="google">Google Login</CardHeader>
      {isAuthLoading && isAuthLoading !== 'false' ? (
        <Spinner />
      ) : (
        <div className="login-method-grid-item-container">
          <button
            className="social-login-button"
            onClick={() => {
              if (token.length == 0) login();
            }}
            disabled={false}
          >
            <Image src={google} alt="Google" height={24} width={24} className="mr-6" />
            <div className="w-full text-xs font-semibold text-center">Continue with Google</div>
          </button>
        </div>
      )}
    </Card>
  );
};
export default Google;
