import { useState } from 'react';
import { uploadFile, getFileUrl } from '@/lib/storage';

export const useStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = async (file: File, path: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = await uploadFile(file, path);
      setLoading(false);
      return url;
    } catch (e: any) {
      setError(e);
      setLoading(false);
      throw e;
    }
  };

  const getUrl = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = await getFileUrl(path);
      setLoading(false);
      return url;
    } catch (e: any) {
      setError(e);
      setLoading(false);
      throw e;
    }
  };

  return { upload, getUrl, loading, error };
};
