const PROXY_URL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const generateProxiedUrl = (url) => `${PROXY_URL}${encodeURIComponent(url)}`;

const downloadXml = (i18, ax, url) => {
  const proxiedUrl = generateProxiedUrl(url);
  return ax.get(proxiedUrl)
    .then((rs) => {
      if (rs.data.status.error) {
        throw new Error(i18.t('errors.failedLoading'));
      }
      return rs.data.contents;
    });
};

export default downloadXml;
