"use strict";$(function(){$("img").click(function(){$(".enlargeImageModalSource").attr("src",$("img").attr("src")),$("#enlargeImageModal").modal("show")}),$(".ladda-button").click(function(){var t=$("input:hidden")[0].value,a=null;"unfinished"===t&&(a=function(){$(".ladda-button").attr("disabled",!0)}),submitAjax($(this),{type:"PUT",url:"/api/task/state/"+this.id+"/"+this.name+"?where="+t},{success:"成功",fail:"失败"},a)}),$("div.main").css("margin-bottom",15+$(".navbar-fixed-bottom").height())});