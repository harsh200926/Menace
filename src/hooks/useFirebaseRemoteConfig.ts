import { useState, useEffect } from 'react';
import { getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { auth } from '@/lib/firebase';

export const useFirebaseRemoteConfig = () => {
  const [config, setConfig] = useState<RemoteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initConfig = async () => {
      try {
        const remoteConfig = getRemoteConfig(auth.app);
        await remoteConfig.setConfigSettings({
          minimumFetchIntervalMillis: 3600000 // 1 hour
        });
        await remoteConfig.fetchAndActivate();
        setConfig(remoteConfig);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize remote config'));
      } finally {
        setLoading(false);
      }
    };

    initConfig();
  }, []);

  const getConfigValue = <T = string>(key: string, defaultValue: T): T => {
    if (!config) return defaultValue;
    try {
      const value = getValue(config, key);
      return value.asString() as T;
    } catch (err) {
      console.error(`Failed to get remote config value for key: ${key}`, err);
      return defaultValue;
    }
  };

  const getBooleanValue = (key: string, defaultValue: boolean = false): boolean => {
    if (!config) return defaultValue;
    try {
      const value = getValue(config, key);
      return value.asBoolean();
    } catch (err) {
      console.error(`Failed to get remote config boolean value for key: ${key}`, err);
      return defaultValue;
    }
  };

  const getNumberValue = (key: string, defaultValue: number = 0): number => {
    if (!config) return defaultValue;
    try {
      const value = getValue(config, key);
      return value.asNumber();
    } catch (err) {
      console.error(`Failed to get remote config number value for key: ${key}`, err);
      return defaultValue;
    }
  };

  const getJSONValue = <T = any>(key: string, defaultValue: T): T => {
    if (!config) return defaultValue;
    try {
      const value = getValue(config, key);
      return JSON.parse(value.asString());
    } catch (err) {
      console.error(`Failed to get remote config JSON value for key: ${key}`, err);
      return defaultValue;
    }
  };

  return {
    config,
    loading,
    error,
    getConfigValue,
    getBooleanValue,
    getNumberValue,
    getJSONValue
  };
}; 