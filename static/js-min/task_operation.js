"use strict";String.prototype.getWidth=function(){var t=$("<span>"+this+"</span>").css({position:"absolute",float:"left","white-space":"nowrap",visibility:"hidden",font:$(".task-info").css("font")}).appendTo($("body")),e=t.width();return t.remove(),e};var vm=new Vue({delimiters:["${","}"],el:"#vm",data:{items:[],currentPage:0,loading:!1,count:0,limit:5,isSearch:!1},created:function(){this.$resource("/api/task/get/count?where="+$("input:hidden")[0].value).get().then(function(t){t.json().then(function(t){vm.count=t.result,vm.count?vm.get():$("#vm").html("<h4>任务正在路上...</h4>")})})},methods:{_showError:function(t){t.json().then(function(t){return console.log("Error: "+t.message)})},get:function(){vm.loading=!0;var t=$("input:hidden")[0].value,e="/api/task/get/page/"+(vm.currentPage+1)+"?where="+t;vm.isSearch&&(e+="&keyword="+$("#searchContent").val()),vm.$resource(e).get().then(function(t){vm.loading=!1,t.json().then(function(t){t.result.forEach(function(t){for(var e=.9*$(window).width()*.75,n=t.type+" "+t.title,i=!1;n.getWidth()>e;)i=!0,n=t.type+" "+t.title,t.title=t.title.substr(0,t.title.length-1);i&&(t.title+="...")}),vm.items=vm.items.concat(t.result),vm.currentPage++})},function(t){vm.loading=!1,vm._showError(t)})},stick:function(t){var e=$("#"+t.id),n=Ladda.create(e[0]);Date.now();startPay({fee:1,body:"任务置顶费用"},function(){n.start(),vm.$resource("/api/task/state/stick/"+t.id).update().then(function(t){vm.loading=!1,t.json().then(function(t){e.text(t.result?"成功":"失败"),setTimeout(function(){e.text("置顶"),n.stop()},1e3)})},function(t){e.text("失败"),setTimeout(function(){e.text("置顶"),n.stop()},1e3),vm._showError(t)})},function(){alert("支付失败，请重试")})},detail:function(t){window.location.href="/task/detail/"+t.id+"?where="+$("input:hidden")[0].value},init:function(t){vm.items=[],vm.currentPage=0,vm.loading=!1,vm.isSearch=t;var e="/api/task/get/count?where="+$("input:hidden")[0].value;vm.isSearch&&(e+="&keyword="+$("#searchContent").val()),vm.$resource(e).get().then(function(t){t.json().then(function(t){vm.count=t.result,vm.get()})})}}});window.vm=vm,$(function(){var t=$(vm.$el),e=$(".fa-spinner");e.hide(),"index"===$("input:hidden")[0].value?t.css("margin-bottom","40px"):(t.css("max-height","500px"),vm.limit=8),t.scroll(function(){var n=t.height(),i=t[0].scrollHeight;t[0].scrollTop+n>=i&&(console.log("滚动条到底部了"),vm.currentPage*vm.limit<vm.count?(e.show(),vm.get()):e.hide())})});