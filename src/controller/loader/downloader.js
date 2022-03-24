import axios from 'axios';

const ax = axios.create();

const PROXY_URL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const generateProxiedUrl = (url) => new URL(`${PROXY_URL}${encodeURIComponent(url)}`);

const downloadXml = (url) => {
  const proxiedUrl = generateProxiedUrl(url);
  return ax.get(proxiedUrl)
    .then((rs) => rs.data.contents)
    .catch(() => {
      const error = new Error();
      error.type = 'networkError';
      return Promise.reject(error);
    });
};

export default downloadXml;
