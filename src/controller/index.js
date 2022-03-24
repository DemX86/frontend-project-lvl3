import loadFeed from './loader/index.js';
import updateFeedsBg from './updater.js';

const changeLanguage = (event, watchedState) => {
  watchedState.ui.form.state = 'start';
  watchedState.lng = event.target.dataset.lng;
};

const handlePostActions = (event, watchedState) => {
  const postId = Number(event.target.dataset.postId);
  watchedState.postsRead.push(postId);

  if (event.target.tagName === 'BUTTON') {
    watchedState.ui.modal.loadedPostId = postId;
  }
};

export {
  loadFeed,
  changeLanguage,
  handlePostActions,
  updateFeedsBg,
};
