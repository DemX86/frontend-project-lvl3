import 'bootstrap';

import i18next from 'i18next';
import onChange from 'on-change';

import resources from './locales/index.js';
import {
  changeLanguage,
  handlePostActions,
  loadFeed,
  updateFeeds,
} from './controller.js';
import {
  prepareModal,
  renderFeeds,
  renderForm,
  renderPosts,
} from './render.js';

const app = () => {
  const defaultLanguage = 'ru';

  const i18 = i18next.createInstance();
  i18.init({
    lng: defaultLanguage,
    resources,
  })
    .then(() => {
      const state = {
        language: defaultLanguage,
        feeds: [],
        posts: [],
        postReadIds: [],
        ui: {
          form: {
            state: 'start',
            error: null,
          },
          modal: {
            loadedPostId: null,
          },
        },
      };
      const watchedState = onChange(state, (path, value) => {
        switch (path) {
          case 'language': {
            i18.changeLanguage(value)
              .then(() => {
                renderForm(i18, state.ui.form);
              });
            break;
          }
          case 'feeds': {
            renderFeeds(i18, state.feeds);
            break;
          }
          case 'posts':
          case 'postReadIds': {
            renderPosts(i18, state);
            break;
          }
          case 'ui.form.state': {
            renderForm(i18, state.ui.form);
            break;
          }
          case 'ui.modal.loadedPostId': {
            prepareModal(i18, state);
            break;
          }
          // no default
        }
      });

      const form = document.querySelector('form');
      form.addEventListener('submit', (event) => {
        loadFeed(event, watchedState);
      });

      const postsContainer = document.querySelector('#posts');
      postsContainer.addEventListener('click', (event) => {
        handlePostActions(event, watchedState);
      });

      const languageSelector = document.querySelector('#language-selector');
      languageSelector.addEventListener('click', (event) => {
        changeLanguage(event, watchedState);
      });

      updateFeeds(watchedState);

      renderForm(i18, state.ui.form);
    });
};

export default app;
