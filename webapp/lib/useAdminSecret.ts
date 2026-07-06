'use client';

import { useEffect, useState } from 'react';

const CLE = 'admin_secret';

export function useAdminSecret() {
  const [secret, setSecretState] = useState('');

  useEffect(() => {
    const stocke = window.localStorage.getItem(CLE);
    if (stocke) setSecretState(stocke);
  }, []);

  function setSecret(valeur: string) {
    setSecretState(valeur);
    if (valeur) window.localStorage.setItem(CLE, valeur);
    else window.localStorage.removeItem(CLE);
  }

  return [secret, setSecret] as const;
}
