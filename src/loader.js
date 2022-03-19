import { string } from 'yup';
import parseXml from './parser';

const PROXY_URL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const generateProxiedUrl = (url) => `${PROXY_URL}${encodeURIComponent(url)}`;

const validateUrl = (i18, watchedState, rawUrl) => {
  const schema = string()
    .url();
  return schema.validate(rawUrl)
    .catch(() => {
      throw new Error(i18.t('errors.invalidFeedUrl'));
    })
    .then((cleanUrl) => {
      const feedUrls = watchedState.feeds.map((feed) => feed.url);
      if (feedUrls.includes(cleanUrl)) {
        throw new Error(i18.t('errors.duplicateFeedUrl'));
      }
      return cleanUrl;
    });
};

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

const saveFeed = (watchedState, feedUrl, feedData) => {
  const feedId = watchedState.feeds.length + 1;
  const feed = {
    id: feedId,
    url: feedUrl,
    title: feedData.title,
    desc: feedData.desc,
  };
  const posts = feedData.items.map((post, index) => {
    const postId = watchedState.posts.length + index + 1;
    return {
      postId,
      feedId,
      ...post,
    };
  });
  watchedState.feeds.push(feed);
  watchedState.posts.push(...posts);
};

const loadFeed = (event, i18, ax, watchedState) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const feedUrl = data.get('feed-url').trim();
  watchedState.ui.form.state = 'processing';
  validateUrl(i18, watchedState, feedUrl)
    .then((url) => downloadXml(i18, ax, url))
    .then((content) => parseXml(i18, content))
    .then((feedData) => saveFeed(watchedState, feedUrl, feedData))
    .then(() => {
      watchedState.ui.form.error = null;
      watchedState.ui.form.state = 'ready';
    })
    .catch((error) => {
      watchedState.ui.form.error = error.message;
      watchedState.ui.form.state = 'error';
    });
};

export default loadFeed;
export { downloadXml };
