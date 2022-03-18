import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';

import resources from './locales/index';
import loadFeed from './loader';
import { renderFeeds, renderForm, renderPosts } from './view';

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
    feedUrls: [],
    ui: {
      form: {
        state: 'ready',
        error: null,
      },
    },
  };
  const watchedState = onChange(state, (path, value) => {
    // console.log(JSON.stringify(state, null, 2)); // todo remove

    if (path === 'ui.form.state') {
      renderForm(i18, state.ui.form);
    } else if (path === 'feeds') {
      renderFeeds(i18, state.feeds);
    } else if (path === 'posts') {
      renderPosts(i18, state.posts);
    } else if (path === 'lng') {
      i18.changeLanguage(value)
        .then(() => {
          renderForm(i18, state.ui.form);
        });
    }
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    loadFeed(e, i18, ax, watchedState);
  });

  const lngSelector = document.querySelector('#lng-selector');
  lngSelector.addEventListener('click', (e) => {
    watchedState.ui.form.state = 'ready';
    watchedState.lng = e.target.dataset.lng;
  });

  renderForm(i18, state.ui.form);
};

app();
