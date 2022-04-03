import i18next from 'i18next';
import onChange from 'on-change';

import resources from './locales/index.js';
import {
  addModalCloseEventHandlers,
  changeLanguage,
  handleReadPost,
  loadFeed,
  updateFeeds,
} from './controller.js';
import {
  renderModal,
  renderFeedLoadingProcess,
  renderFeeds,
  renderFormValidationProcess,
  renderPosts,
} from './render.js';

const app = () => {
  const defaultLanguage = 'ru';

  const form = document.querySelector('form');
  const uiElements = {
    input: form.querySelector('#feed-url'),
    button: form.querySelector('button'),
    feedback: document.querySelector('#feedback'),
    spinner: document.querySelector('#spinner'),
  };

  const i18 = i18next.createInstance();
  i18.init({
    lng: defaultLanguage,
    resources,
  })
    .then(() => {
      const state = {
        language: defaultLanguage,
        formValidation: {
          status: 'idle',
          isValid: true,
          error: null,
        },
        feedLoading: {
          status: 'idle',
          error: null,
        },
        feeds: [],
        posts: [],
        modal: {
          isVisible: false,
          postId: null,
        },
        ui: {
          postReadIds: [],
        },
      };
      const watchedState = onChange(state, (path, value) => {
        switch (path) {
          case 'language': {
            i18.changeLanguage(value)
              .then(() => {
                renderFormValidationProcess(i18, state.formValidation, uiElements);
              });
            break;
          }
          case 'formValidation.status': {
            renderFormValidationProcess(i18, state.formValidation, uiElements);
            break;
          }
          case 'feedLoading.status': {
            renderFeedLoadingProcess(i18, state.feedLoading, uiElements);
            break;
          }
          case 'feeds': {
            renderFeeds(i18, state);
            break;
          }
          case 'posts':
          case 'ui.postReadIds': {
            renderPosts(i18, state);
            break;
          }
          case 'modal.isVisible': {
            renderModal(i18, state);
            break;
          }
          // no default
        }
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const feedUrl = formData.get('feed-url').trim();
        loadFeed(watchedState, feedUrl);
      });

      const postsContainer = document.querySelector('#posts');
      postsContainer.addEventListener('click', (event) => {
        const postElement = event.target;
        handleReadPost(watchedState, postElement);
      });

      addModalCloseEventHandlers(watchedState);

      const languageSelector = document.querySelector('#language-selector');
      languageSelector.addEventListener('click', (event) => {
        const { language } = event.event.target.dataset;
        changeLanguage(watchedState, language);
      });

      updateFeeds(watchedState);

      renderFormValidationProcess(i18, state.formValidation, uiElements);
    });
};

export default app;
