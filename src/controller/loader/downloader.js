const PROXY_URL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const generateProxiedUrl = (url) => new URL(`${PROXY_URL}${encodeURIComponent(url)}`);

const downloadXml = (i18, ax, url) => {
  const proxiedUrl = generateProxiedUrl(url);
  return ax.get(proxiedUrl)
    .then((rs) => rs.data.contents)
    .catch(() => Promise.reject(Error(i18.t('form.errors.networkError'))));
};

export default downloadXml;
