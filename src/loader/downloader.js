const PROXY_URL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const generateProxiedUrl = (url) => `${PROXY_URL}${encodeURIComponent(url)}`;

const downloadXml = (i18, ax, url) => {
  const proxiedUrl = generateProxiedUrl(url);
  return ax.get(proxiedUrl)
    .then((rs) => {
      console.log('RS:', rs);
      if (rs.data.status.error) {
        return Promise.reject(Error(i18.t('form.errors.failedLoading')));
      }
      return rs.data.contents;
    });
};

export default downloadXml;
