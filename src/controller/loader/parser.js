const parseXml = (i18, content) => {
  const getElementText = (doc, tag) => {
    const element = doc.querySelector(tag);
    return element.textContent;
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');
  const error = doc.querySelector('parsererror');
  if (error) {
    return Promise.reject(Error(i18.t('form.errors.invalidFeedXml')));
  }
  const title = getElementText(doc, 'channel title');
  const desc = getElementText(doc, 'channel description');
  const items = [...doc.querySelectorAll('item')]
    .map((item) => ({
      title: getElementText(item, 'title'),
      desc: getElementText(item, 'description'),
      link: getElementText(item, 'link'),
    }));
  const rs = {
    title,
    desc,
    items,
  };
  return Promise.resolve(rs);
};

export default parseXml;
