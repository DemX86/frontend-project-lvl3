const renderIdleStatus = (uiElements) => {
  uiElements.formInput.removeAttribute('readonly');
  uiElements.formInput.focus();
  uiElements.formButton.disabled = false;
  uiElements.spinner.classList.add('d-none');
};

const renderProcessingStatus = (uiElements) => {
  uiElements.feedback.textContent = '';
  uiElements.formButton.disabled = true;
  uiElements.formInput.setAttribute('readonly', 'true');
  uiElements.spinner.classList.remove('d-none');
};

const renderErrorStatus = (uiElements, errorMessage) => {
  uiElements.feedback.classList.remove('text-success');
  uiElements.feedback.classList.add('text-danger');
  uiElements.feedback.textContent = errorMessage;
  uiElements.formInput.removeAttribute('readonly');
  uiElements.formButton.disabled = false;
  uiElements.spinner.classList.add('d-none');
};

const renderSuccessStatus = (uiElements, successMessage) => {
  renderIdleStatus(uiElements);
  uiElements.feedback.classList.remove('text-danger');
  uiElements.feedback.classList.add('text-success');
  uiElements.feedback.textContent = successMessage;
  uiElements.formInput.value = '';
};

const renderFormValidationProcess = (i18, formValidationState, uiElements) => {
  const textElements = document.querySelectorAll('[data-text]');
  textElements.forEach((element) => {
    element.textContent = i18.t(element.dataset.text);
  });

  switch (formValidationState.status) {
    case 'idle': {
      renderIdleStatus(uiElements);
      uiElements.formInput.classList.remove('is-invalid');
      break;
    }
    case 'validation': {
      renderProcessingStatus(uiElements);
      break;
    }
    case 'error': {
      uiElements.formInput.classList.add('is-invalid');
      renderErrorStatus(uiElements, i18.t(`errors.${formValidationState.error}`));
      break;
    }
    default:
      throw new Error(`Untracked formValidation status: ${formValidationState.status}`);
  }
};

const renderFeedLoadingProcess = (i18, feedLoadingState, uiElements) => {
  switch (feedLoadingState.status) {
    case 'idle': {
      renderIdleStatus(uiElements);
      break;
    }
    case 'loading': {
      renderProcessingStatus(uiElements);
      break;
    }
    case 'error': {
      renderErrorStatus(uiElements, i18.t(`errors.${feedLoadingState.error}`));
      break;
    }
    case 'success': {
      renderSuccessStatus(uiElements, i18.t('success'));
      break;
    }
    default:
      throw new Error(`Untracked feedLoading status: ${feedLoadingState.status}`);
  }
};

const renderFeeds = (i18, state) => {
  const container = document.querySelector('#feeds');

  const card = document.createElement('div');
  card.classList.add('card');

  const h4 = document.createElement('h4');
  h4.classList.add('card-header');
  h4.dataset.text = 'feedsColumn';
  h4.textContent = i18.t('feedsColumn');

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'list-group-flush');
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'py-2');

    const h6 = document.createElement('h6');
    h6.classList.add('m-0');
    h6.textContent = feed.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-secondary');
    p.textContent = feed.description;

    li.append(h6, p);
    feedsList.append(li);
  });

  card.append(h4, feedsList);
  container.replaceChildren(card);
};

const renderPosts = (i18, state) => {
  const container = document.querySelector('#posts');

  const card = document.createElement('div');
  card.classList.add('card');

  const h4 = document.createElement('h4');
  h4.classList.add('card-header');
  h4.dataset.text = 'postsColumn';
  h4.textContent = i18.t('postsColumn');

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'list-group-flush');
  state.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'py-2');

    const a = document.createElement('a');
    a.classList.add('m-0');
    if (state.ui.postReadIds.includes(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }
    a.href = post.link;
    a.target = '_blank';
    a.textContent = post.title;
    a.dataset.postId = post.id;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18.t('viewPostButton');
    button.dataset.text = 'viewPostButton';
    button.dataset.postId = post.id;

    li.append(a, button);
    postsList.append(li);
  });

  card.append(h4, postsList);
  container.replaceChildren(card);
};

const renderModal = (i18, state) => {
  const body = document.querySelector('body');
  const modal = document.querySelector('#modal');

  if (state.modal.isVisible) {
    const post = state.posts.find((element) => element.id === state.modal.postId);

    const modalTitle = modal.querySelector('#modal-title');
    const modalBody = modal.querySelector('#modal-body');
    const modalRead = modal.querySelector('#modal-read');
    const modalClose = modal.querySelector('#modal-close');

    modalTitle.textContent = post.title;
    const p = document.createElement('p');
    p.textContent = post.description;
    modalBody.replaceChildren(p);
    modalRead.textContent = i18.t('modal.read');
    modalRead.href = post.link;
    modalClose.textContent = i18.t('modal.close');

    const backdrop = document.createElement('div');
    backdrop.id = 'backdrop';
    backdrop.classList.add('modal-backdrop', 'show');
    body.append(backdrop);
    body.classList.add('modal-open');
    body.style.overflow = 'hidden';
    body.style.paddingRight = '15px';

    modal.classList.add('show');
    modal.style.display = 'block';
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');
  } else {
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.removeAttribute('aria-modal');
    modal.removeAttribute('role');
    modal.setAttribute('aria-hidden', 'true');

    const backdrop = body.querySelector('#backdrop');
    backdrop.remove();
    body.classList.remove('modal-open');
    body.removeAttribute('style');
  }
};

export {
  renderModal,
  renderFeedLoadingProcess,
  renderFeeds,
  renderFormValidationProcess,
  renderPosts,
};
