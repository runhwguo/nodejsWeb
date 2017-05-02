let vm = new Vue({
  delimiters: ['${', '}'],
  el: '#vm',
  http: {
    timeout: 5000
  },
  data: {
    items: [],
    loading: true,
    page: 1,
    count: -1
  },
  created: function () { // VM初始化成功后的回调函数
    Vue.http
      .get('/api/admin/task/count')
      .then(resp => {
        console.log(resp);
        this.get();
      }, resp => {
        console.log(resp);
      });

  },
  methods: {
    _showError: resp => {
      resp.json().then(result => console.log('Error: ' + result.message));
    },
    get: isSearch => {
      vm.loading = true;
      Vue.http.get('/api/admin/task/get', {
        params: {
          page: vm.page
        }
      }).then(resp => {
        vm.loading = false;
        if (isSearch) {

        }
        resp.json().then(data => {
          vm.items = data.result
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
    }
  }
});

$(() => {
  let vmDiv = $(vm.$el);

  vmDiv.scroll(() => {
    let divHeight = vmDiv.height();
    let scrollHeight = vmDiv[0].scrollHeight;
    let scrollTop = vmDiv[0].scrollTop;
    if (scrollTop + divHeight >= scrollHeight) {
      console.log("滚动条到底部了");
    }
  });

  $('.glyphicon-search').click(() => {
    console.log('search click');
  });
});