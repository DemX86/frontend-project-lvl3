const renderForm = (i18, state) => {
  const textElements = document.querySelectorAll('[data-text]');
  textElements.forEach((el) => {
    el.textContent = i18.t(el.dataset.text); // eslint-disable-line no-param-reassign
  });

  const form = document.querySelector('form');
  const input = form.querySelector('#url');
  const feedback = form.querySelector('.invalid-feedback');
  const button = form.querySelector('button');

  switch (state.ui.form.state) {
    case 'ready': {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
      form.reset();
      input.focus();
      button.disabled = false;
      break;
    }
    case 'validating':
    case 'processing': {
      button.disabled = true;
      break;
    }
    case 'error': {
      input.classList.add('is-invalid');
      feedback.textContent = state.ui.form.error;
      button.disabled = false;
      break;
    }
    default:
      throw new Error(`Untracked UI state: ${state.ui.form.state}`);
  }
};

const renderList = (urls) => {
  const list = document.querySelector('#list');
  const ul = document.createElement('ul');
  urls.forEach((url) => {
    const li = document.createElement('li');
    li.textContent = url;
    ul.append(li);
  });
  list.replaceChildren(ul);
};

export { renderForm, renderList };
