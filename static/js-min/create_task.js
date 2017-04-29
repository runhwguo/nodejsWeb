"use strict";$(function(){var e=$("form"),t=$(".ladda-label"),a=$("#deadline"),i=$("#createTaskTab");a.datepicker({minDate:-1,maxDate:31,autoclose:!0,yearSuffix:"年",dateFormat:"yy-mm-dd",onSelect:function(){e.data("bootstrapValidator").updateStatus("deadline","NOT_VALIDATED",null).validateField("deadline")},showMonthAfterYear:!0,dayNamesMin:["日","一","二","三","四","五","六"],monthNames:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]}),a.click(function(e){var t=$("#ui-datepicker-div"),a=$(window).width(),i=$(window).height(),o=t.width(),r=t.height(),s=(a-o)/2,l=(i-r)/2;t.css({left:s,top:l,position:"absolute"})}),e.bootstrapValidator({message:"The form is not valid",feedbackIcons:{valid:"glyphicon glyphicon-ok",invalid:"glyphicon glyphicon-remove",validating:"glyphicon glyphicon-refresh"},fields:{type:{message:"The type is not valid",validators:{notEmpty:{message:"请选择任务类型"}}},shareCount:{message:"The type is not valid",validators:{notEmpty:{message:"请填写共享次数"}}},title:{message:"The title is not valid",validators:{notEmpty:{message:"请填入任务标题"}}},reward:{message:"The reward is not valid",validators:{regexp:{regexp:/^[0-9]\d*$/,message:"请输入正整数的钱数"}}},deadline:{message:"The deadline is not valid",validators:{notEmpty:{message:"请选择结束日期"}}}}}).on("success.form.bv",function(a){a.preventDefault();var i=function(a){var i=$(".submit"),o=Ladda.create(i.get(0));o.start();var r=e.serializeArray(),s={};$.map(r,function(e,t){return s[e.name]=e.value.replace(/"/g,'\\"')}),a?s.outTradeNo=a:s.reward=-s.reward,$.ajaxFileUpload({type:e.attr("method"),url:e.attr("action"),secureuri:!1,fileElementId:"file",data:s,dataType:"json",success:function(e,a){console.log(e,a),t.text("成功"),setTimeout(function(){t.text("发布"),o.stop(),i.attr("disabled",!0)},1e3)},error:function(e,a,i){t.text("失败"),setTimeout(function(){t.text("发布"),o.stop()},1e3)}})},o=$("#rewardType").text(),r=$("#reward")[0].value;if("悬赏"===o&&r>0){var s=Date.now()+"";startPay({fee:r,body:"发布任务预支付费用",outTradeNo:s},function(){i(s)},function(){})}else i()}),i.attr("href","javascript:void(0)");var o=$(".selectpicker");o.change(function(){"会员共享"===o[0].value?$("#shareCountDiv").show(300):$("#shareCountDiv").hide(300)}),$('li[name="rewardValue"]').click(function(){console.log(this),$("#rewardType").text($(this).text())}),$.uploadPreview({input_field:"#file",preview_box:"#image-preview",label_field:"#image-label",label_default:"图片补充",label_selected:"更换图片",no_label:!1}),e.css("margin-bottom",15+$(".navbar-fixed-bottom").height())});