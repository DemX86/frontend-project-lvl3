import { string } from 'yup';
import downloadXml from './downloader';
import parseXml from './parser';

const validateUrl = (i18, watchedState, rawUrl) => {
  if (rawUrl === '') {
    return Promise.reject(Error(i18.t('form.errors.emptyUrl')));
  }
  const schema = string().url();
  return schema.validate(rawUrl)
    .catch(() => {
      return Promise.reject(Error(i18.t('form.errors.invalidFeedUrl')));
    })
    .then((cleanUrl) => {
      const feedUrls = watchedState.feeds.map((feed) => feed.url);
      if (feedUrls.includes(cleanUrl)) {
        return Promise.reject(Error(i18.t('form.errors.duplicateFeedUrl')));
      }
      return cleanUrl;
    });
};

const saveFeed = (watchedState, feedUrl, feedData) => {
  const feedId = watchedState.feeds.length;
  const feed = {
    id: feedId,
    url: feedUrl,
    title: feedData.title,
    desc: feedData.desc,
  };
  const posts = feedData.items.map((post, index) => {
    const postId = watchedState.posts.length + index;
    return {
      id: postId,
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
      watchedState.ui.form.state = 'success';
    })
    .catch((error) => {
      watchedState.ui.form.error = error.message;
      watchedState.ui.form.state = 'error';
    });
};

export default loadFeed;
