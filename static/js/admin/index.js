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
    this.get();
  },
  methods: {
    _showError: resp => {
      resp.json().then(result => console.log('Error: ' + result.message));
    },
    get: isSearch => {
      vm.loading = true;
      vm.$http.get('/api/admin/get', {
        page: vm.page
      }).then(resp => {
        vm.loading = false;
        if (isSearch) {

        }
        resp.json().then(result => vm.items = result.result);
      }, resp => {
        vm.loading = false;
        vm._showError(resp);
      });
    },
    remove: item => {
      vm.$resource('/api/admin/remove').remove({
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
            if (index !== -1) {
              vm.items.splice(index, 1);
              vm.count--;
            }
          } else {
            vm._showError(resp);
          }
        });
      }, vm._showError);
    },
    search: () => {
      console.log('search click');
    }
  }
});