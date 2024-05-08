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
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
} from 'firebase/auth';

import { app } from "../../firebase/config"

import {
  getAuth,
  getIdToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

const Google = ({ token, setToken }: LoginProps) => {
  const { magic } = useMagic();
  const [isAuthLoading, setIsAuthLoading] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  useEffect(() => {
    setIsAuthLoading(localStorage.getItem('isAuthLoading'));
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        if (magic) {
          // const result = await magic?.oauth.getRedirectResult();
          const metadata = await magic?.user.getMetadata();
          debugger
          if (!metadata?.publicAddress) return;
          // setToken(result.magic.idToken);
          // saveUserInfo(result.magic.idToken, 'SOCIAL', metadata?.publicAddress);
          setLoadingFlag('false');
        }
      } catch (e) {
        console.log('social login error: ' + e);
        setLoadingFlag('false');
      }
    };

    checkLogin();
  }, [magic, setToken]);

  const auth = getAuth(app);
  const getToken = async () => {
    const { currentUser } = auth;
    return await getIdToken(currentUser);
  };
  const getMagic = async (token) => {
    const jwt = token ? token : await getToken();
    const user = auth.currentUser
    const idTokenResult = await user?.getIdTokenResult();
    console.log(idTokenResult.token)
    const DID = await magic?.openid.loginWithOIDC({
      // this oidcToken comes from the identity provider
      jwt: idTokenResult?.token,
      // this providerId is provided by Magic
      providerId: "hznAxRkMRso8cXWeqVeHA390SDQAFkzFSp6hdNamH1Y=",
    });
    debugger
  };
  const logInWithEmailAndPassword = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;
      const token = user.accessToken;
      await getMagic(token);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const registerWithEmailAndPassword = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      const token = user.accessToken;
      await getMagic(token);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  const login = async () => {
    isRegister ? registerWithEmailAndPassword() : logInWithEmailAndPassword()
    // setLoadingFlag('true');
    // const provider = new GoogleAuthProvider();

    // try {
    //   // const result = await signInWithPopup(app, provider);

    //   if (!result || !result.user) {
    //     throw new Error('Google sign in failed');
    //   }

    //   const DID = await magic?.openid.loginWithOIDC({
    //     // this oidcToken comes from the identity provider
    //     jwt: result.user.accessToken,
    //     // this providerId is provided by Magic
    //     providerId: "hznAxRkMRso8cXWeqVeHA390SDQAFkzFSp6hdNamH1Y=",
    //   });

    //   const user = await magic?.user.getInfo();
    //   debugger
    //   console.log("-0------", user)
    // } catch (error) {
    //   console.error('Error signing in with Google', error);
    // }
  };

  const setLoadingFlag = (loading: string) => {
    localStorage.setItem('isAuthLoading', loading);
    setIsAuthLoading(loading);
  };

  return (
    <Card>
      <CardHeader id="google">Google Login</CardHeader>
      <div className="flex flex-col gap-2">
        <input className="p-2 border border-black rounded-md" type="text" placeholder={"email"} onChange={(e) => setEmail(e.target.value)} />
        <input className="p-2 border border-black rounded-md" type="password" placeholder={"password"} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex gap-2 items-center mt-2">
        <input className="flex" type="checkbox" onChange={(e) => setIsRegister(e.target.checked)} />
        <p>New user?</p>
      </div>
      {isAuthLoading && isAuthLoading !== 'false' ? (
        <Spinner />
      ) : (
        <button
          className="border border-black rounded-md p-2"
          onClick={() => {
            if (token.length == 0) login();
          }}
          disabled={false}
        >
          {isRegister ? "Register" : "Login"}
        </button>
      )}
    </Card>
  );
};
export default Google;
