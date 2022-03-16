import i18next from 'i18next';
import onChange from 'on-change';
import { string } from 'yup';

import { renderForm, renderList } from './view';
import resources from './locales/index';

import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const validateUrl = (url) => {
  const schema = string().url();
  return schema.validate(url);
};

const app = () => {
  const defaultLanguage = 'ru';
  // const defaultLanguage = 'en';

  const i18 = i18next.createInstance();
  i18.init({
    lng: defaultLanguage,
    resources,
  });
  // todo что делать с возвращаемым промисом?

  const state = {
    lng: defaultLanguage,
    urls: [],
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
      renderForm(i18, state);
    } else if (path === 'urls') {
      renderList(state.urls);
    } else if (path === 'lng') {
      i18.changeLanguage(value)
        .then(() => {
          renderForm(i18, state);
        });
    }
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url').trim();
    watchedState.ui.form.state = 'validating';
    validateUrl(url)
      .then(() => {
        if (watchedState.urls.includes(url)) {
          watchedState.ui.form.error = i18.t('errors.duplicateUrl');
          watchedState.ui.form.state = 'error';
          return;
        }
        watchedState.urls.push(url);
        watchedState.ui.form.error = null;
        watchedState.ui.form.state = 'ready';
      })
      .catch(() => {
        watchedState.ui.form.error = i18.t('errors.invalidUrl');
        watchedState.ui.form.state = 'error';
      });
  });

  const lngSelector = document.querySelector('#lng-selector');
  lngSelector.addEventListener('click', (e) => {
    watchedState.ui.form.state = 'ready';
    watchedState.lng = e.target.dataset.lng;
  });

  renderForm(i18, state);
};

app();
