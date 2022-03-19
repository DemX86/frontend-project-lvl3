import downloadXml from './loader/downloader.js';
import parseXml from './loader/parser.js';

const UPDATE_INTERVAL = 5000;

const updateFeed = (watchedState, savedFeed, newFeedData) => {
  const savedFeedPostLinks = watchedState.posts
    .filter((post) => post.feedId === savedFeed.id)
    .map((post) => post.link);
  const newPosts = newFeedData.items
    .filter((post) => !savedFeedPostLinks.includes(post.link))
    .map((post, index) => {
      const postId = watchedState.posts.length + index;
      return {
        id: postId,
        feedId: savedFeed.id,
        ...post,
      };
    });
  if (newPosts.length !== 0) {
    watchedState.posts.push(...newPosts);
  }
};

const updateFeedsBg = (i18, ax, watchedState) => {
  watchedState.feeds.forEach((feed) => {
    downloadXml(i18, ax, feed.url)
      .then((content) => parseXml(i18, content))
      .then((feedData) => updateFeed(watchedState, feed, feedData))
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
  });
  setTimeout(updateFeedsBg, UPDATE_INTERVAL, i18, ax, watchedState);
};

export default updateFeedsBg;
