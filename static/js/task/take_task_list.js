window.onload = () => {
  const searchContent = $('#searchContent'),
        searchClear   = $('span.glyphicon-remove-circle'),
        searchButton  = $('span.glyphicon-search');

  searchContent.keyup(() => {
    searchClear.show();
  });
  searchClear.hide()
    .click(() => {
      searchContent.val('');
      searchClear.hide();
    });
  searchButton.click(() => {
    vm.init(searchContent.val());
  });
};