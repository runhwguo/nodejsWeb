window.onload = () => {
  let searchContent = $('#searchContent'),
    searchClear = $('.glyphicon-remove-circle'),
    searchButton = $('.glyphicon-search');

  searchClear.hide();
  searchContent.keyup(() => {
    searchClear.show();
  });
  searchClear.click(() => {
    searchContent.val('');
    searchClear.hide();
  });
  searchButton.click(() => {
    vm.init(searchContent.val());
  });
};