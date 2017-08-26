let vm = new Vue({
  delimiters: ['${', '}'],
  el: '#vm',
  http: {
    timeout: 5000
  },
  data: {
    items: [],
    loading: true,
    page: 0,
    count: -1,
    keyword: '',
    LIMIT: 8
  },
  created: function () { // VM初始化成功后的回调函数
    this.init();
  },
  methods: {
    _showError: resp => {
      resp.json().then(result => console.log('Error: ' + result.message));
    },
    get: keyword => {
      vm.loading   = true;
      const params = {
        page: vm.page
      };
      if (keyword) {
        params.keyword = keyword;
      }
      Vue.http.get('/api/admin/task/get', {
        params: params
      }).then(resp => {
        vm.loading = false;
        resp.json().then(data => {
          vm.items = vm.items.concat(data.result);
          vm.page++;
        });
      }, resp => {
        vm.loading = false;
        vm._showError(resp);
      });
    },
    remove: item => {
      Vue.resource('/api/admin/task/remove').remove({
        id: item.id
      }).then(resp => {
        resp.json().then(result => {
          if (result.result) {
            let index = -1;
            for (let i = 0; i < vm.items.length; i++) {
              if (vm.items[i].id === item.id) {
                index = i;
                break;
              }
            }
            if (index >= 0) {
              vm.items.splice(index, 1);
              vm.count--;
            }
          } else {
            vm._showError(resp);
          }
        });
      }, vm._showError);
    },
    init: params => {
      Vue.http
        .get('/api/admin/task/count', {
          params: params
        })
        .then(resp => {
          console.log(resp);
          resp.json().then((data) => {
            vm.page  = 0;
            vm.items = [];
            vm.count = data.result;

            if (params && params.keyword) {
              vm.get(params.keyword);
            } else {
              vm.get();
            }
          });
        }, resp => {
          console.log(resp);
        });
    }
  }
});

$(() => {
  const $vmDiv = $(vm.$el);

  $vmDiv.scroll(() => {
    const divHeight    = $vmDiv.height(),
          scrollHeight = $vmDiv[0].scrollHeight,
          scrollTop    = $vmDiv[0].scrollTop;
    if (scrollTop + divHeight >= scrollHeight) {
      console.log('滚动条到底部了');
      (vm.page * vm.LIMIT < vm.count) && vm.get($('#searchContent').val());
    }
  }).css('max-height', $(window).height() - $('#searchDiv').height());


  $('span.glyphicon-search').click(() => {
    console.log('search click');
    vm.init({
      keyword: $('#searchContent').val()
    });
  });
  $('span.glyphicon-remove-circle').click(() => {
    $('#searchContent').val('');
  });
});