const renderForm = (i18, formState) => {
  const textElements = document.querySelectorAll('[data-text]');
  textElements.forEach((el) => {
    el.textContent = i18.t(el.dataset.text);
  });

  const form = document.querySelector('form');
  const input = form.querySelector('#feed-url');
  const feedback = form.querySelector('.invalid-feedback');
  const button = form.querySelector('button');
  const spinner = document.querySelector('#spinner');

  switch (formState.state) {
    case 'ready': {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
      form.reset();
      input.focus();
      button.disabled = false;
      spinner.classList.add('d-none');
      break;
    }
    case 'processing': {
      button.disabled = true;
      spinner.classList.remove('d-none');
      break;
    }
    case 'error': {
      input.classList.add('is-invalid');
      feedback.textContent = formState.error;
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
    li.classList.add('list-group-item', 'py-2');

    const a = document.createElement('a');
    a.classList.add('m-0');
    a.href = post.link;
    a.target = '_blank';
    a.textContent = post.title;

    li.append(a);
    postsList.append(li);
  });

  card.append(h4, postsList);
  container.replaceChildren(card);
};

export { renderForm, renderFeeds, renderPosts };
