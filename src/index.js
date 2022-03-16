import onChange from 'on-change';
import { string } from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; // todo ?
import { renderForm, renderList } from './view';

const validateUrl = (url) => {
  const schema = string().url();
  return schema.validate(url);
};

const app = () => {
  const state = {
    urls: [],
    ui: {
      form: {
        state: null,
        error: null,
      },
    },
  };
  const watchedState = onChange(state, (path) => {
    // todo remove debug
    // console.log(JSON.stringify(state, null, 2));

    if (path === 'ui.form.state') {
      renderForm(state);
    } else if (path === 'urls') {
      renderList(state.urls);
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
          watchedState.ui.form.error = 'Эта ссылка уже была добавлена ранее';
          watchedState.ui.form.state = 'error';
          return;
        }
        watchedState.urls.push(url);
        watchedState.ui.form.error = null;
        watchedState.ui.form.state = 'ready';
      })
      .catch(() => {
        watchedState.ui.form.error = 'Невалидная ссылка';
        watchedState.ui.form.state = 'error';
      });
  });
};

app();
