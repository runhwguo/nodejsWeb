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

let vm = new Vue({
  delimiters: ['${', '}'],
  el: '#vm',
  data: {
    items: [],
    currentPage: 0,
    loading: false,
    count: 0,
    limit: 5,
    isSearch: false
  },
  created: function () { // VM初始化成功后的回调函数
    this.$resource('/api/task/get/count?where=' + $('#where').val())
      .get()
      .then(resp => {
        resp
          .json()
          .then(data => {
            vm.count = data.result;
            if (vm.count) {
              vm.get();
            } else {
              let vmHtml = '任务已被领完';
              if ($('#where').val().endsWith('ed')) {
                vmHtml = '这里空空如也'
              }
              $('#vm').html(`<h4>${ vmHtml }</h4>`);
            }
          });
      });
  },
  methods: {
    _showError: resp => {
      resp.json().then(data => console.log('Error: ' + data.message));
    },
    _sortByPriority: () => {
      vm.items.sort((a, b) => {
        return b.priority - a.priority;
      });
    },
    get: () => {
      vm.loading = true;
      let where = $('#where').val();
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
              let info = item.type + ' ' + item.title;
              let isNeedProcess = false;
              while (info.getWidth() > maxWidthOfInfo) {
                isNeedProcess = true;
                info = item.type + ' ' + item.title;
                item.title = item.title.substr(0, item.title.length - 1);
              }
              if (isNeedProcess) {
                item.title += '...';
              }
            });
            vm.items = vm.items.concat(data.result);
            vm._sortByPriority();
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

      startPay({fee: 100, body: '任务置顶费用'}, () => {
        loading.start();

        const normalStickButtonWord = stickButton.text(),
          interval = 1000;

        vm.$resource(`/api/task/state/stick/${ item.id }`).update()
          .then(resp => {
            vm.loading = false;
            resp.json().then(data => {
              stickButton.text(data.result.result ? '成功' : data.result.message);
              // 在本地增加任务的优先级，以便排序
              if (data.result.result) {
                item.priority++;
              }
              vm._sortByPriority();
              setTimeout(() => {
                stickButton.text(normalStickButtonWord);
                loading.stop();
              }, interval);
            });
          }, resp => {
            stickButton.text('失败');
            setTimeout(() => {
              stickButton.text(normalStickButtonWord);
              loading.stop();
            }, interval);
            vm._showError(resp);
          });
      }, () => {
        alert('支付失败，请重试');
      });
    },
    detail: item => {
      const viewDetailSuccess = () => {
        window.location.href = `/task/detail/${item.id}?where=` + $('#where').val();
      };

      if (item.type === '会员共享' && // 查看的是会员共享
        item.reward !== 0 && //
        !($('#where').val().endsWith('ed')) && // 是要接任务，不是自我查看任务
        !item.isSelfOrderedTask && // 自己接过了
        !item.isSelfPublishedTask) { // 自己发布的任务
        startPay({fee: item.reward, body: '购买会员共享费用', attach: item.id}, viewDetailSuccess, () => {

        });
      } else {
        viewDetailSuccess();
      }
    },
    init: isSearch => {
      vm.items = [];
      vm.currentPage = 0;
      vm.loading = false;
      vm.isSearch = isSearch;
      let url = '/api/task/get/count?where=' + $('#where').val();
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
  let vmDiv = $(vm.$el);

  if ($('#where').val() === 'index') {
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
        vm.get();
      } else {
      }
    }
  });
});