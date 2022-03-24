import 'bootstrap';

import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';

import resources from './locales/index.js';
import * as controller from './controller/index.js';
import * as view from './view/index.js';

const app = () => {
  const defaultLanguage = 'ru';

  const i18 = i18next.createInstance();
  i18.init({
    lng: defaultLanguage,
    resources,
  });

  const ax = axios.create();

  const state = {
    lng: defaultLanguage,
    feeds: [],
    posts: [],
    postsRead: [],
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
      case 'lng': {
        i18.changeLanguage(value)
          .then(() => {
            view.renderForm(i18, state.ui.form);
          });
        break;
      }
      case 'feeds': {
        view.renderFeeds(i18, state.feeds);
        break;
      }
      case 'posts': {
        view.renderPosts(i18, state.posts);
        view.markReadPosts(state.postsRead);
        break;
      }
      case 'postsRead': {
        view.markReadPosts(state.postsRead);
        break;
      }
      case 'ui.form.state': {
        view.renderForm(i18, state.ui.form);
        break;
      }
      case 'ui.modal.loadedPostId': {
        view.prepareModal(i18, state);
        break;
      }
      // no default
    }
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (event) => {
    controller.loadFeed(event, i18, ax, watchedState);
  });

  const postsContainer = document.querySelector('#posts');
  postsContainer.addEventListener('click', (event) => {
    controller.handlePostActions(event, watchedState);
  });

  const lngSelector = document.querySelector('#lng-selector');
  lngSelector.addEventListener('click', (event) => {
    controller.changeLanguage(event, watchedState);
  });

  controller.updateFeedsBg(i18, ax, watchedState);

  view.renderForm(i18, state.ui.form);
};

export default app;
