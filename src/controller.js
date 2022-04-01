import axios from 'axios';
import { setLocale, string } from 'yup';
import _ from 'lodash';

const POST_ID_PREFIX = 'post_';
const FEED_ID_PREFIX = 'feed_';
const UPDATE_INTERVAL = 5000;

const validateUrl = (rawUrl, feeds) => {
  setLocale({
    mixed: {
      notOneOf: 'duplicateFeedUrl',
      required: 'emptyUrl',
    },
    string: {
      url: 'invalidFeedUrl',
    },
  });
  const feedUrls = feeds.map((feed) => feed.url);
  const schema = string().required().url().notOneOf(feedUrls);
  return schema.validate(rawUrl)
    .catch((error) => {
      error.process = 'formValidation';
      error.type = error.message;
      throw error;
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
    .catch((error) => {
      error.process = 'feedLoading';
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
    error.process = 'feedLoading';
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
  watchedState.formValidation.status = 'validation';
  validateUrl(feedUrl, watchedState.feeds)
    .then(() => {
      watchedState.formValidation.isValid = true;
      watchedState.formValidation.error = null;
      watchedState.formValidation.status = 'idle';
      watchedState.feedLoading.status = 'loading';
    })
    .then(() => downloadXml(feedUrl))
    .then((content) => parseXml(content))
    .then((feedData) => saveFeed(watchedState, feedUrl, feedData))
    .then(() => {
      watchedState.feedLoading.error = null;
      watchedState.feedLoading.status = 'success';
    })
    .catch((error) => {
      switch (error.process) {
        case 'formValidation': {
          watchedState.formValidation.isValid = false;
          watchedState.formValidation.error = error.type;
          watchedState.formValidation.status = 'error';
          break;
        }
        case 'feedLoading': {
          watchedState.feedLoading.error = error.type;
          watchedState.feedLoading.status = 'error';
          break;
        }
        default:
          throw new Error(`Error handling untracked process: ${error.process}`);
      }
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

const updateFeed = (watchedState, feed) => (
  downloadXml(feed.url)
    .then((content) => parseXml(content))
    .then((feedData) => updateSavedFeed(watchedState, feed, feedData))
    .catch((error) => {
      watchedState.feedLoading.error = error.type;
      watchedState.feedLoading.status = 'error';
    })
);

const updateFeeds = (watchedState) => {
  Promise.all(watchedState.feeds.map((feed) => updateFeed(watchedState, feed)))
    .then(() => {
      watchedState.feedLoading.error = null;
      watchedState.feedLoading.status = 'idle';
    })
    .finally(() => {
      setTimeout(updateFeeds, UPDATE_INTERVAL, watchedState);
    });
};

const changeLanguage = (event, watchedState) => {
  watchedState.formValidation.status = 'idle';
  watchedState.language = event.target.dataset.language;
};

const handlePostActions = (event, watchedState) => {
  const { postId } = event.target.dataset;
  watchedState.ui.postReadIds.push(postId);

  if (event.target.tagName === 'BUTTON') {
    watchedState.modal.loadedPostId = postId;
  }
};

export {
  changeLanguage,
  handlePostActions,
  loadFeed,
  updateFeeds,
};
