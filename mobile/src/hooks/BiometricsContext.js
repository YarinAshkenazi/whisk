import React, { createContext, useContext } from 'react';

const BiometricsContext = createContext({
  isEnabled: false,
  label: 'Use Biometrics',
  toggle: async () => {},
});

export function BiometricsProvider({ value, children }) {
  return (
    <BiometricsContext.Provider value={value}>
      {children}
    </BiometricsContext.Provider>
  );
}

export function useBiometricsContext() {
  return useContext(BiometricsContext);
}
