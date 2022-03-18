import { string } from 'yup';
import parseXml from './parser';

const PROXY_URL = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

const generateProxiedUrl = (url) => `${PROXY_URL}${encodeURIComponent(url)}`;

const validateUrl = (url) => {
  const schema = string().url();
  return schema.validate(url);
};

const loadFeed = (e, i18, ax, watchedState) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const feedUrl = data.get('feed-url').trim();
  watchedState.ui.form.state = 'processing';
  validateUrl(feedUrl)
    .catch(() => {
      throw new Error(i18.t('errors.invalidFeedUrl'));
    })
    .then((url) => {
      if (watchedState.feedUrls.includes(url)) {
        throw new Error(i18.t('errors.duplicateFeedUrl'));
      }
      return url;
    })
    .then((url) => ax.get(generateProxiedUrl(url)))
    .then((rs) => {
      if (rs.data.status.error) {
        throw new Error(i18.t('errors.failedLoading'));
      }
      const content = rs.data.contents;
      return parseXml(i18, content);
    })
    .then((feedData) => {
      const feedId = watchedState.feeds.length + 1;
      const feed = {
        id: feedId,
        title: feedData.title,
        desc: feedData.desc,
      };
      const posts = feedData.items.map((post, index) => {
        const postId = watchedState.posts.length + index + 1;
        return { postId, feedId, ...post };
      });
      watchedState.feedUrls.push(feedUrl);
      watchedState.feeds.push(feed);
      watchedState.posts.push(...posts);
      watchedState.ui.form.error = null;
      watchedState.ui.form.state = 'ready';
    })
    .catch((error) => {
      watchedState.ui.form.error = error.message;
      watchedState.ui.form.state = 'error';
    });
};

export default loadFeed;
