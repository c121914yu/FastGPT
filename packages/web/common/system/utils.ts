import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getUserFingerprint = async () => {
  const fpPromise = FingerprintJS.load();
  const fp = await fpPromise;
  const result = await fp.get();
  console.log(result.visitorId);
};

export const getWebReqUrl = (url: string = '') => {
  if (!url) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return url;

  if (!url.startsWith('/')) return url;

  return `${baseUrl}${url}`;
};
