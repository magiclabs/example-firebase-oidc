import React, { useCallback, useState } from 'react';
import { logout } from '@/utils/common';
import { LoginProps } from '@/utils/types';
import { useMagic } from '../MagicProvider';
import Spinner from '@/components/ui/Spinner';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/config';

const Disconnect = ({ setToken }: LoginProps) => {
  const { magic } = useMagic();
  const [disabled, setDisabled] = useState(false);

  const disconnect = useCallback(async () => {
    if (!magic) return;
    try {
      setDisabled(true);
      // Firebase sign out
      await signOut(firebaseAuth);
      // Magic sign out
      await logout(setToken, magic);
      setDisabled(false);
    } catch (error) {
      setDisabled(false);
      console.error(error);
    }
  }, [magic, setToken]);

  return (
    <div className="wallet-method-container">
      <button className="wallet-method" onClick={disconnect} disabled={disabled}>
        {disabled ? (
          <div className="loading-container w-[115px]">
            <Spinner />
          </div>
        ) : (
          'disconnect()'
        )}
      </button>
      <div className="wallet-method-desc">Disconnects user from dApp.</div>
    </div>
  );
};

export default Disconnect;
