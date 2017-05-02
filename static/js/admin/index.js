let vm = new Vue({
  delimiters: ['${', '}'],
  el: '#vm',
  http: {
    timeout: 5000
  },
  data: {
    items: [],
    loading: false,
    page: 1,
    count: -1
  },
  created: function () { // VM初始化成功后的回调函数
    this.get();
    this.items.push(
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      },
      {
        date: '任务时间',
        content: '任务详情'
      }
    );
  },
  methods: {
    _showError: resp => {
      resp.json().then(result => console.log('Error: ' + result.message));
    },
    get: () => {
      vm.loading = true;
      vm.$http.get('/api/admin/get', {
        page: vm.page
      }).then(resp => {
        vm.loading = false;
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