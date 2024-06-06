import FingerprintJS from '@fingerprintjs/fingerprintjs';

const fpPromise = FingerprintJS.load();

export const getUserFingerprint = async () => {
  const fp = await fpPromise;
  const result = await fp.get();
  console.log(result.visitorId);
};

export const connectBaseUrl = (url: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return url;

  return `${baseUrl}${url}`;
};
