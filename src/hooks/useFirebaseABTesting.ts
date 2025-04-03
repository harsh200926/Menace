import { useState, useEffect } from 'react';
import { getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { auth } from '@/lib/firebase';

export const useFirebaseABTesting = () => {
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
        setError(err instanceof Error ? err : new Error('Failed to initialize A/B testing config'));
      } finally {
        setLoading(false);
      }
    };

    initConfig();
  }, []);

  const getExperimentVariant = (experimentName: string): string => {
    if (!config) return 'control';
    try {
      const value = getValue(config, `experiment_${experimentName}`);
      return value.asString();
    } catch (err) {
      console.error(`Failed to get experiment variant for: ${experimentName}`, err);
      return 'control';
    }
  };

  const isInExperiment = (experimentName: string): boolean => {
    return getExperimentVariant(experimentName) !== 'control';
  };

  const getExperimentValue = <T = any>(
    experimentName: string,
    key: string,
    defaultValue: T
  ): T => {
    if (!config) return defaultValue;
    try {
      const variant = getExperimentVariant(experimentName);
      const value = getValue(config, `experiment_${experimentName}_${key}_${variant}`);
      return JSON.parse(value.asString());
    } catch (err) {
      console.error(`Failed to get experiment value for: ${experimentName}.${key}`, err);
      return defaultValue;
    }
  };

  const getExperimentBoolean = (
    experimentName: string,
    key: string,
    defaultValue: boolean = false
  ): boolean => {
    if (!config) return defaultValue;
    try {
      const variant = getExperimentVariant(experimentName);
      const value = getValue(config, `experiment_${experimentName}_${key}_${variant}`);
      return value.asBoolean();
    } catch (err) {
      console.error(`Failed to get experiment boolean for: ${experimentName}.${key}`, err);
      return defaultValue;
    }
  };

  const getExperimentNumber = (
    experimentName: string,
    key: string,
    defaultValue: number = 0
  ): number => {
    if (!config) return defaultValue;
    try {
      const variant = getExperimentVariant(experimentName);
      const value = getValue(config, `experiment_${experimentName}_${key}_${variant}`);
      return value.asNumber();
    } catch (err) {
      console.error(`Failed to get experiment number for: ${experimentName}.${key}`, err);
      return defaultValue;
    }
  };

  return {
    config,
    loading,
    error,
    getExperimentVariant,
    isInExperiment,
    getExperimentValue,
    getExperimentBoolean,
    getExperimentNumber
  };
}; 