String.prototype.getWidth = function () {
  let o = $('<span>' + this + '</span>')
      .css({
        'position': 'absolute',
        'float': 'left',
        'white-space': 'nowrap',
        'visibility': 'hidden',
        'font': $('.task-info').css('font')
      })
      .appendTo($('body')),
    w = o.width();

  o.remove();
  return w;
};

var vm = new Vue({
  delimiters: ['${', '}'],
  el: '#vm',
  data: {
    items: [],
    currentPage: 0,
    loading: false,
    count: -1,
    limit: 5,
    isSearch: false
  },
  created: function () { // VM初始化成功后的回调函数
    this.$resource('/api/task/get/count?where=' + $('input:hidden')[0].value)
      .get()
      .then(resp => {
        resp
          .json()
          .then(data => {
            vm.count = data.result;
            if (vm.count) {
              vm.get();
            } else {
              $('#vm').html('<h3>任务正在路上...</h3>')
            }
          });
      });
  },
  methods: {
    _showError: resp => {
      resp.json().then(data => console.log('Error: ' + data.message));
    },
    get: () => {
      vm.loading = true;
      let where = $('input:hidden')[0].value;
      let url = `/api/task/get/page/${vm.currentPage + 1}?where=${ where }`;
      if (vm.isSearch) {
        url += '&keyword=' + $('#searchContent').val();
      }
      vm.$resource(url)
        .get()
        .then(resp => {
          vm.loading = false;
          resp.json().then(data => {
            data.result.forEach(item => {
              let maxWidthOfInfo = $(window).width() * 0.9 * 0.75;
              let info = null;
              do {
                info = item.type + ' ' + item.detail;
                item.detail = item.detail.substr(0, item.detail.length - 1);
              } while (info.getWidth() > maxWidthOfInfo);
              item.detail += '...';
            });
            vm.items = vm.items.concat(data.result);
            vm.currentPage++;
          });
        }, resp => {
          vm.loading = false;
          vm._showError(resp);
        });
    },
    stick: item => {
      let stickButton = $(`#${item.id}`),
        loading = Ladda.create(stickButton[0]);
      loading.start();
      vm.$resource(`/api/task/state/stick/${item.id}`).update()
        .then(resp => {
          vm.loading = false;
          resp.json().then(result => {
            stickButton.text(result.result ? '成功' : '失败');
            setTimeout(() => {
              stickButton.text('置顶');
              loading.stop();
            }, 500);
          });
        }, resp => {
          stickButton.text('失败');
          setTimeout(() => {
            stickButton.text('置顶');
            loading.stop();
          }, 500);
          vm._showError(resp);
        });
    },
    detail: item => {
      window.location.href = `/task/detail/${item.id}?where=` + $('input:hidden')[0].value;
    },
    init: (isSearch) => {
      vm.items = [];
      vm.currentPage = 0;
      vm.loading = false;
      vm.isSearch = isSearch;
      let url = '/api/task/get/count?where=' + $('input:hidden')[0].value;
      if (vm.isSearch) {
        url += '&keyword=' + $('#searchContent').val();
      }
      vm.$resource(url)
        .get()
        .then(resp => {
          resp
            .json()
            .then(data => {
              vm.count = data.result;
              vm.get();
            });
        });
    }
  }
});
window.vm = vm;
$(() => {
  let vmDiv = $('#vm'),
    loading = $('.fa-spinner');

  loading.hide();
  if ($('input:hidden')[0].value === 'index') {
    vmDiv.css('margin-bottom', '40px');
  } else {
    vmDiv.css('max-height', '500px');
    vm.limit = 8;
  }
  vmDiv.scroll(() => {
    let divHeight = vmDiv.height();
    let scrollHeight = vmDiv[0].scrollHeight;
    let scrollTop = vmDiv[0].scrollTop;
    if (scrollTop + divHeight >= scrollHeight) {
      console.log("滚动条到底部了");
      if (vm.currentPage * vm.limit < vm.count) {
        loading.show();
        vm.get();
      } else {
        loading.hide();
      }
    }
  });
});