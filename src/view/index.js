const renderForm = (i18, formState) => {
  const textElements = document.querySelectorAll('[data-text]');
  textElements.forEach((el) => {
    el.textContent = i18.t(el.dataset.text);
  });

  const form = document.querySelector('form');
  const input = form.querySelector('#feed-url');
  const button = form.querySelector('button');
  const feedback = document.querySelector('#feedback');
  const spinner = document.querySelector('#spinner');

  switch (formState.state) {
    case 'start': {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-success', 'text-danger');
      feedback.textContent = '';
      input.value = '';
      input.removeAttribute('readonly');
      input.focus();
      button.disabled = false;
      spinner.classList.add('d-none');
      break;
    }
    case 'processing': {
      button.disabled = true;
      input.setAttribute('readonly', 'true');
      spinner.classList.remove('d-none');
      break;
    }
    case 'error': {
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = formState.error;
      input.removeAttribute('readonly');
      button.disabled = false;
      spinner.classList.add('d-none');
      break;
    }
    case 'success': {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18.t('form.success');
      input.value = '';
      input.removeAttribute('readonly');
      input.focus();
      button.disabled = false;
      spinner.classList.add('d-none');
      break;
    }
    default:
      throw new Error(`Untracked UI state: ${formState.state}`);
  }
};

const renderFeeds = (i18, feeds) => {
  const container = document.querySelector('#feeds');

  const card = document.createElement('div');
  card.classList.add('card');

  const h4 = document.createElement('h4');
  h4.classList.add('card-header');
  h4.dataset.text = 'feedsColumn';
  h4.textContent = i18.t('feedsColumn');

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'list-group-flush');
  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'py-2');

    const h6 = document.createElement('h6');
    h6.classList.add('m-0');
    h6.textContent = feed.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-secondary');
    p.textContent = feed.desc;

    li.append(h6, p);
    feedsList.append(li);
  });

  card.append(h4, feedsList);
  container.replaceChildren(card);
};

const renderPosts = (i18, posts) => {
  const container = document.querySelector('#posts');

  const card = document.createElement('div');
  card.classList.add('card');

  const h4 = document.createElement('h4');
  h4.classList.add('card-header');
  h4.dataset.text = 'postsColumn';
  h4.textContent = i18.t('postsColumn');

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'list-group-flush');
  posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'py-2');

    const a = document.createElement('a');
    a.classList.add('m-0', 'fw-bold');
    a.href = post.link;
    a.target = '_blank';
    a.textContent = post.title;
    a.dataset.postId = post.id;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18.t('viewPostButton');
    button.dataset.text = 'viewPostButton';
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.dataset.postId = post.id;

    li.append(a, button);
    postsList.append(li);
  });

  card.append(h4, postsList);
  container.replaceChildren(card);
};

const markReadPosts = (postsRead) => {
  const postsContainer = document.querySelector('#posts');
  postsRead.forEach((postId) => {
    const a = postsContainer.querySelector(`[data-post-id="${postId}"]`);
    a.classList.remove('fw-bold');
    a.classList.add('fw-normal', 'link-secondary');
  });
};

const prepareModal = (i18, state) => {
  const postId = state.ui.modal.loadedPostId;
  const post = state.posts[postId];

  const modal = document.querySelector('#modal');
  const modalTitle = modal.querySelector('#modal-title');
  const modalBody = modal.querySelector('#modal-body');
  const modalRead = modal.querySelector('#modal-read');
  const modalClose = modal.querySelector('#modal-close');

  modalTitle.textContent = post.title;
  const p = document.createElement('p');
  p.textContent = post.desc;
  modalBody.replaceChildren(p);
  modalRead.textContent = i18.t('modal.read');
  modalRead.href = post.link;
  modalClose.textContent = i18.t('modal.close');
};

export {
  renderForm,
  renderFeeds,
  renderPosts,
  markReadPosts,
  prepareModal,
};
