import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';

import resources from './locales/index';
import loadFeed from './loader';
import updateFeedsBg from './updater';
import { renderFeeds, renderForm, renderPosts } from './view';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/style.css';

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
    },
  };
  const watchedState = onChange(state, (path, value) => {
    if (path === 'ui.form.state') {
      renderForm(i18, state.ui.form);
    } else if (path === 'feeds') {
      renderFeeds(i18, state.feeds);
    } else if (path === 'posts') {
      renderPosts(i18, state.posts, state.postsRead);
    } else if (path === 'lng') {
      i18.changeLanguage(value)
        .then(() => {
          renderForm(i18, state.ui.form);
        });
    }
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (event) => {
    loadFeed(event, i18, ax, watchedState);
  });

  const lngSelector = document.querySelector('#lng-selector');
  lngSelector.addEventListener('click', (event) => {
    watchedState.ui.form.state = 'start';
    watchedState.lng = event.target.dataset.lng;
  });

  renderForm(i18, state.ui.form);

  updateFeedsBg(i18, ax, watchedState);
};

app();
