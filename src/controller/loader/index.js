import { string } from 'yup';

import downloadXml from './downloader.js';
import parseXml from './parser.js';

const validateUrl = (watchedState, rawUrl) => {
  if (rawUrl === '') {
    const error = new Error();
    error.type = 'emptyUrl';
    return Promise.reject(error);
  }
  const schema = string()
    .url();
  return schema.validate(rawUrl)
    .catch(() => {
      const error = new Error();
      error.type = 'invalidFeedUrl';
      return Promise.reject(error);
    })
    .then((cleanUrl) => {
      const feedUrls = watchedState.feeds.map((feed) => feed.url);
      if (feedUrls.includes(cleanUrl)) {
        const error = new Error();
        error.type = 'duplicateFeedUrl';
        return Promise.reject(error);
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

const loadFeed = (event, watchedState) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const feedUrl = data.get('feed-url')
    .trim();
  watchedState.ui.form.state = 'processing';
  validateUrl(watchedState, feedUrl)
    .then(() => downloadXml(feedUrl))
    .then((content) => parseXml(content))
    .then((feedData) => saveFeed(watchedState, feedUrl, feedData))
    .then(() => {
      watchedState.ui.form.error = null;
      watchedState.ui.form.state = 'success';
    })
    .catch((error) => {
      watchedState.ui.form.error = error.type;
      watchedState.ui.form.state = 'error';
    });
};

export default loadFeed;
