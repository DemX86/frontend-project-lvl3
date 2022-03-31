import axios from 'axios';
import { string } from 'yup';
import _ from 'lodash';

const POST_ID_PREFIX = 'post_';
const FEED_ID_PREFIX = 'feed_';
const UPDATE_INTERVAL = 5000;

const validateUrl = (watchedState, rawUrl) => {
  if (rawUrl === '') {
    const error = new Error('Should be not empty');
    error.type = 'emptyUrl';
    throw error;
  }
  const schema = string().url();
  return schema.validate(rawUrl)
    .catch(() => {
      const error = new Error('URL must be valid');
      error.type = 'invalidFeedUrl';
      throw error;
    })
    .then((cleanUrl) => {
      const feedUrls = watchedState.feeds.map((feed) => feed.url);
      if (feedUrls.includes(cleanUrl)) {
        const error = new Error('RSS exists already');
        error.type = 'duplicateFeedUrl';
        throw error;
      }
      return cleanUrl;
    });
};

const generateProxiedUrl = (url) => {
  const proxyUrl = 'https://allorigins.hexlet.app/get';
  const proxiedUrl = new URL(proxyUrl);
  proxiedUrl.searchParams.set('disableCache', 'true');
  proxiedUrl.searchParams.set('url', url);
  return proxiedUrl;
};

const downloadXml = (url) => {
  const proxiedUrl = generateProxiedUrl(url);
  return axios.get(proxiedUrl.href)
    .then((response) => response.data.contents)
    .catch(() => {
      const error = new Error('Network error');
      error.type = 'networkError';
      throw error;
    });
};

const parseXml = (content) => {
  const getElementText = (doc, tag) => {
    const element = doc.querySelector(tag);
    return element.textContent;
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');
  // noinspection CssInvalidHtmlTagReference
  const errorElement = doc.querySelector('parsererror');
  if (errorElement) {
    const error = new Error('Invalid RSS structure');
    error.type = 'invalidFeedXml';
    throw error;
  }
  const title = getElementText(doc, 'channel title');
  const description = getElementText(doc, 'channel description');
  // noinspection CssInvalidHtmlTagReference
  const items = [...doc.querySelectorAll('item')]
    .map((item) => ({
      title: getElementText(item, 'title'),
      description: getElementText(item, 'description'),
      link: getElementText(item, 'link'),
    }));
  return {
    title,
    description,
    items,
  };
};

const saveFeed = (watchedState, feedUrl, feedData) => {
  const feedId = _.uniqueId(FEED_ID_PREFIX);
  const feed = {
    id: feedId,
    url: feedUrl,
    title: feedData.title,
    description: feedData.description,
  };
  const posts = feedData.items.map((post) => ({
    id: _.uniqueId(POST_ID_PREFIX),
    feedId,
    ...post,
  }));
  watchedState.feeds.push(feed);
  watchedState.posts.push(...posts);
};

const loadFeed = (event, watchedState) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const feedUrl = data.get('feed-url').trim();
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

const updateSavedFeed = (watchedState, savedFeed, newFeedData) => {
  const savedFeedPostLinks = watchedState.posts
    .filter((post) => post.feedId === savedFeed.id)
    .map((post) => post.link);
  const newPosts = newFeedData.items
    .filter((post) => !savedFeedPostLinks.includes(post.link))
    .map((post) => ({
      id: _.uniqueId(POST_ID_PREFIX),
      feedId: savedFeed.id,
      ...post,
    }));
  if (newPosts.length !== 0) {
    watchedState.posts.push(...newPosts);
  }
};

const updateFeeds = (watchedState) => {
  const updateFeed = (feed) => {
    downloadXml(feed.url)
      .then((content) => parseXml(content))
      .then((feedData) => updateSavedFeed(watchedState, feed, feedData))
      .catch((error) => {
        watchedState.ui.form.error = error.type;
        watchedState.ui.form.state = 'error';
      });
  };

  Promise.all(watchedState.feeds.map(updateFeed))
    .finally(() => {
      setTimeout(updateFeeds, UPDATE_INTERVAL, watchedState);
    });
};

const changeLanguage = (event, watchedState) => {
  watchedState.ui.form.state = 'start';
  watchedState.language = event.target.dataset.language;
};

const handlePostActions = (event, watchedState) => {
  const { postId } = event.target.dataset;
  watchedState.postReadIds.push(postId);

  if (event.target.tagName === 'BUTTON') {
    watchedState.ui.modal.loadedPostId = postId;
  }
};

export {
  changeLanguage,
  handlePostActions,
  loadFeed,
  updateFeeds,
};
