/*
 * 
 * 
 * Used for any unauthorized application is prohibited.
 * http://ishangzu.com/
 */
 // 定义对应的属性
var ErpUtil = {
	pageModuleIdForPage : "",
	dictInfo : {},// 数据字典对象
	comboboxData:{},//下拉内容信息
	ajaxNameSpace : "",// ajax提交请求域
	downAction : "client/FileDownController/filedown",
	exportAction : "j/ExcelController/excel",
	joyardSessionKey : "",
	bizDate : "",
	easyControls : [ "easyui-datebox", "easyui-combobox", 
	    			 "easyui-numberbox", "combobox-f",
	    			"combotree-f", "easyui-menubutton", "combotree-f", "datebox-f" ]
};
function isEmpty(value) {
	return value ? false : true;
}
var loginCode;
var loginOrg;

/**
 * cookie存取 存：ErpUtil.cookie("key",value); 取：ErpUtil.cookie("key");
 */

ErpUtil.cookie = function(name, value, options) {
	if (typeof value != 'undefined') {
		options = options || {};
		if (value === null) {
			value = '';
			options.expires = -1;
		}
		var expires = '';
		if (options.expires
				&& (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime()
						+ (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires
															// attribute,
															// max-age is not
															// supported by IE
		}
		var path = options.path ? '; path=' + options.path : '';
		var domain = options.domain ? '; domain=' + options.domain : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [ name, '=', encodeURIComponent(value), expires,
				path, domain, secure ].join('');
	} else {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for ( var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie
							.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};



/**
 * 消息提示框
 */
ErpUtil.message = {
	/*alert : function(msg, call) {
		return $.messager.alert("提示信息", msg, "info", call);
	},*/
	alert :function(message){
		$.bootstrapGrowl(message, {
            ele: 'body', // which element to append to
            type: 'info', // (null, 'info', 'danger', 'success')
             offset: {from: 'top', amount: 200}, // 'top', or 'bottom'
             align: 'center', // ('left', 'right', or 'center')
             width: 250, // (integer, or 'auto')
             delay: 2000, // Time while the message will be displayed. It's not equivalent to the *demo* timeOut!
             allow_dismiss: true, // If true then will display a cross to close the popup.
             stackup_spacing: 10 // spacing between consecutively stacked growls.
    	});
	},
	confirm : function(msg, call) {
		return $.messager.confirm("确认信息", msg, call);
	},
	// 提示信息
	showMsg : function(msg, call) {
		var $msg = $('<p style="cursor:pointer;">' + msg + '</p>').click(call);
		var msg_show = $.messager.show({
			title : '提示信息',
			height : 180,
			msg : $msg,
			timeout : 2000,
			showType : 'fade',
			zIndex : 7999
		});
	}
};


(function($, j) {
	function show(target, showType, speed, delay) {
		var win = $(target).window("window");
		speed = speed || "normal";
		delay = delay || 500;
		if (!win) {
			return;
		}
		switch (showType) {
		case "fade":
			win.fadeIn(speed);
			break;
		case "slide":
			win.slideDown(speed);
			break;
		case "show":
			win.show(speed);
			break;
		default:
			win.show();
			break;
		}
		var timeout = null;
		if (delay > 0) {
			timeout = window.setTimeout(function() {
				hide(target, showType, speed, delay);
			}, delay);
		}
		win.hover(function() {
			if (timeout != null) {
				window.clearTimeout(timeout);
			}
		}, function() {
			timeout = window.setTimeout(function() {
				hide(target, showType, speed, delay);
			}, delay);
		});
	}


	function hide(target, showType, speed, delay) {
		if (target.locked === true) {
			return;
		}
		target.locked = true;
		var win = $(target).window("window");
		switch (showType) {
		case "fade":
			win.fadeOut(speed);
			break;
		case "slide":
			win.slideUp(speed);
			break;
		case "show":
			win.hide(speed);
			break;
		default:
			win.hide();
			break;
		}
		setTimeout(function() {
			$(target).window("destroy");
		}, delay);
	}

	function create(title, contents, options) {
		var win = $("<div class=\"messager-body\"></div>").appendTo("body");
		win.append(contents);
		options = options || {};
		options.showType = options.showType || "";
		options.showSpeed = options.showSpeed || "normal";
		options.timeout = options.timeout || 4000;
		options.buttons = options.buttons || [];
		var toolbar = $("<div class=\"messager-button\"></div>").appendTo(win);
		var buttons = options.buttons;
		if (options.buttons.length === 0) {
			options.closable = true;
		}
		var triggerOnClose = true;
		for ( var i = 0; i < buttons.length; i++) {
			var item = buttons[i];
			var button = $("<a></a>").attr("href", "javascript:void(0);").text(
					item.text);
			button.css("margin-left", "10px").bind("click", function() {
				if (item.triggerOnClose === false) {
					triggerOnClose = false;
				}
				item.handler.call(win)
			});
			button.appendTo(toolbar).linkbutton();
		}
		var closeHandler = options.onClose;
		delete options.onClose;
		options = $.extend(
				{
					title : title,
					noheader : !!title ? false : true,
					width : 300,
					height : "auto",
					collapsible : false,
					minimizable : false,
					maximizable : false,
					shadow : false,
					draggable : false,
					resizable : false,
					closable : true,
					closed : true,
					onBeforeOpen : function() {
						show(this, options.showType, options.showSpeed,
								options.timeout);
						return false;
					},
					onBeforeClose : function() {
						if (closeHandler && triggerOnClose) {
							setTimeout(function() {
								closeHandler.call(win);
							}, 0);
						}
						hide(this, options.showType, options.showSpeed, 500);
						return false;
					}
				}, options);
		win.window(options);
		win.window("window").addClass("messager-window");
		win.children("div.messager-button").children("a:first").focus();
		return win;
	}

	var messager = {
		show : function(title, message, options) {
			options = options || {};
			var opts = $.extend({
				showType : "slide",
				showSpeed : 600,
				width : 250,
				height : 100,
				timeout : 4000
			}, options);
			var win = create(title, message, opts);
			win.window("window").css(
					{
						left : "",
						top : "",
						right : 0,
						zIndex : $.fn.window.defaults.zIndex++,
						bottom : -document.body.scrollTop
								- document.documentElement.scrollTop
					});
			win.window("open");
		},
		alert : function(title, message, icon, callback) {
			message = "<div class=\"messager-icon messager-" + icon
					+ "\"></div><div>" + message
					+ "</div><div style=\"clear:both;\"/>";
			var win = null;
			var options = {
				buttons : [ {
					text : j.messager.defaults.ok,
					handler : function() {
						win.window("close");
					}
				} ],
				onClose : function() {
					if (callback) {
						callback();
					}
				}
			};
			win = create(title, message, options);
			win.window("open");
		},
		confirm : function(title, message, callback) {
			message = "<div class=\"messager-icon messager-question\"></div><div>"
					+ message + "</div><div style=\"clear:both;\"/>";
			var win = null, action = false;
			var options = {
				buttons : [ {
					text : j.messager.defaults.ok,
					handler : function() {
						win.window("close");
						action = true;
					}
				}, {
					text : j.messager.defaults.cancel,
					handler : function() {
						win.window("close");
						action = false;
					}
				} ],
				onClose : function() {
					if (callback) {
						callback(action);
					}
				}
			};
			win = create(title, message, options);
			win.window("open");
		},
		prompt : function(title, message, callback) {
			message = "<div class=\"messager-icon messager-question\"></div><div>"
					+ message
					+ "</div><br/><input class=\"messager-input\" type=\"text\"/><div style=\"clear:both;\"/>";
			var win = null;
			var options = {
				buttons : [ {
					text : j.messager.defaults.ok,
					handler : function() {
						win.window("close");
						if (callback) {
							callback($(".messager-input", win).val());
						}
						return false;
					}
				}, {
					text : j.messager.defaults.cancel,
					handler : function() {
						win.window("close");
						if (callback) {
							callback("");
						}
						return false;
					}
				} ]
			};
			win = create(title, message, options);
			win.children("input.messager-input").focus();
			win.window("open");
		}
	};
	j.messager = messager;
	j.messager.progress = $.messager.progress;
	j.messager.defaults = {
		ok : "保存",
		cancel : "取消"
	};
})(jQuery, ErpUtil);

/**
 * 封装常规表格查询时后台错误消息提醒机制
 * 增加param.tableid参数，其它与datagrid参数相同
 * 
 */
ErpUtil.querygrid=function(param){
	
	if(!param.onLoadError){
		param.onLoadError=function(){
			ErpUtil.message.alert("查询信息出错.");
		}
	}
	
	if(!param.loadFilter){
		param.loadFilter=function(data){
			if(data==null){
				ErpUtil.message.alert("查询信息出错.");
				return null;
			}else if((data.code==null || data.code!=0) || (data.errorCode!=null && data.errorCode!=0)){
				ErpUtil.message.alert(data.msg);
				return null;
			}else{
				if(param.par){
					param.par(data.par);
				}
				return data.obj;
			}
		}
	}
	
	return $(param.tableid).datagrid(param);

}

ErpUtil.dialog=function(param){
	if(!param.onLoadError){
		param.onLoadError=function(){
			ErpUtil.message.alert("加载页面出错.");
		}
	}

	if(!param.extractor){

		param.extractor=function(data){
			if(data==null){
				ErpUtil.message.alert("加载页面出错.");
				return null;
			}else if((data.code!=null && data.code!=0) || (data.errorCode!=null && data.errorCode!=0)){
				ErpUtil.message.alert(data.msg);
				return null;
			}else{
				return data;
			}
		}

	}

	var dialog=$(param.id);
	if(dialog==null || dialog.length<=0){
		dialog=$("<div class='common-dialog' id='"+param.id+"'/>");
	}
	return dialog.dialog(param);

}

/**
 * 公共导出模块
 * @param param
 */
ErpUtil.export=function(param){

		var gridTable=$(param.tableid);

		var opts =gridTable.datagrid('getColumnFields');

		var field={};
		var dict={};

		for(i=0;i<opts.length;i++){
			var col =gridTable.datagrid( "getColumnOption" , opts[i] );
			if(col.hidden != 'true' && col.hidden!=true && true!=col.exclude){

				var property=col.field;

				if(col.prop!=null){
					property=col.prop;
				}

				field[property] = col.title;

				if(col.dict!=null){
					dict[property]=col.dict;
				}

			}
		}
	
		var query =[];
		if(param.searchid){
			query=ErpUtil.ajaxStatus.loadJson(param.searchid);
			query=query==null?{}:query;
		}else if(param.formid){
			query=$.toJSON($("#generalcontract_search_form").serializeArray());
			query=query==null?[]:query;
		}else{
			query=gridTable.datagrid("options").queryParams.query;
			query=query==null?[]:query;
		}

		var props =$.toJSON(field);

		var dicts=$.toJSON(dict);

		var url = param.url;

		var queryParam ="<input type='hidden' name='query' value='"+query+"' />";
		var fieldParam ="<input type='hidden' name='props' value='"+props+"' />";
		var dictsParam ="<input type='hidden' name='dicts' value='"+dicts+"' />";

		jQuery('<form action="'+ url +'" method="'+ ('post') +'">'+queryParam+fieldParam+dictsParam+'</form>').appendTo("body").submit().remove();

}

/**
 * 增加上传组件简单消息提示封装
 * 增加param.fileid
 */
ErpUtil.fileupload=function(param){
	
	var done=param.done;
	
	if(param.done){
		
		param.done=function(e,data){
			if(data==null || data.result==null ||  data.result.code==null){
				$.messager.alert('系统提示', data.msg, "info");
				// 增加异常时，回调操作
				if (param.error) {
					param.error(data);
				}
			}else{
				var result=data.result;
				if (result.code== "0") {
					
					done(e,data);
					
					if(param.callback){
						param.callback(result);
					}
					
				} else if (result.code == '200' || result.code == '201' || result.code == '199') {
						$.messager.alert('系统提示', result.msg, "info", function() {
							// type=1表示又系统异常时返回的重新登录，如session超时
							window.parent.location.href = "/isz_base/login.jsp";
		
						});
					} else if (result.code == '202'){
						$.messager.alert(result.msg);
					}else {
						$.messager.alert('系统提示', result.msg, "info");
						// 增加异常时，回调操作
						if (param.error) {
							param.error(data);
						}
					}
		}
			}
		
	}
	
	return $("#"+param.fileid).fileupload(param);
	
}

// 新版ajax，同步改为异步，新增promise模式
ErpUtil.newAjax = function(param) {
	var dtd = $.Deferred(),
		ajaxNameSpace = ErpUtil.ajaxNameSpace;
	//默认参数信息
	var defautlParam = {
		type : "POST",
		contentType : "application/json;charset=UTF-8",
		dataType:'json', // 服务器返回json格式数据
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			$.messager.alert('错误', "status: " + XMLHttpRequest.status
					+ "<br/> statusText: " + XMLHttpRequest.statusText
					+ "<br/> Info:" + $(XMLHttpRequest.responseText).text(),
					"error");
			dtd.reject(XMLHttpRequest.statusText)
		},
		success : function(data) {
			if (data.code && data.code != "0") {
				if (data.code == '200' || data.code == '201'
						|| data.code == '199') {
					$.messager.alert('系统提示', data.msg, "info", function() {
						// type=1表示又系统异常时返回的重新登录，如session超时
						window.parent.location.href = "/isz_base/login.jsp";

					});
				} else if (data.code == '202'){
					$.messager.alert(data.msg);
					  }
				else {
					$.messager.alert('系统提示', data.msg, "info");
					// 增加异常时，回调操作
					if (param.callerror) {
						param.callerror(data);
					}
				}
				dtd.reject(data);
			} else {
				if (param.callback) {
					param.callback.call(this,data);
				}
				dtd.resolve(data);
			}
		}
	};
	
	// 当传入data为json对象时，将其转为字符串格式
	if (typeof param.data != "string") {
		param.data = $.toJSON(param.data);
	}
	
	if(param.url.indexOf(".action")!=-1 || param.url.indexOf(".jsp")!=-1){
		param.url = ajaxNameSpace + param.url;
	}else{
		param.url = ajaxNameSpace + param.url + ".action";
	}
	defautlParam = $.extend(defautlParam, param);
	$.ajax(defautlParam);

	return dtd;	
};

/**
 * hasLoading="false"时不显示遮挡阴影 ajax提交
 */

ErpUtil.ajax = function(param) {
	var seriNo = ErpUtil.ajaxStatus.seriNoRandom(),
		ajaxNameSpace = ErpUtil.ajaxNameSpace;
	//默认参数信息
	var defautlParam = {
		type : "POST",
		contentType : "application/json;charset=UTF-8",
		dataType:'json', // 服务器返回json格式数据
		beforeSend : function(XMLHttpRequest) {
			if (ErpUtil.ajaxStatus.isOver()) {
				ErpUtil.ajaxStatus.status[seriNo] = seriNo;
				ErpUtil.ajaxStatus.showLoading();
			}
			XMLHttpRequest.setRequestHeader("__module_id",
					ErpUtil.pageModuleIdForPage);
		},
		complete : function(XMLHttpRequest) {
			delete ErpUtil.ajaxStatus.status[seriNo];
			if (ErpUtil.ajaxStatus.isOver()) {
				ErpUtil.ajaxStatus.hidLoading();
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			ErpUtil.ajaxStatus.hidLoading();
			ErpUtil.ajaxStatus.clean();
			$.messager.alert('错误', "status: " + XMLHttpRequest.status
					+ "<br/> statusText: " + XMLHttpRequest.statusText
					+ "<br/> Info:" + $(XMLHttpRequest.responseText).text(),
					"error");
			dtd.reject(XMLHttpRequest.statusText)
		},
		success : function(data) {
			if (data.code && data.code != "0") {
				if (data.code == '200' || data.code == '201'
						|| data.code == '199') {
					$.messager.alert('系统提示', data.msg, "info", function() {
						// type=1表示又系统异常时返回的重新登录，如session超时
						window.parent.location.href = "/isz_base/login.jsp";
					});
				} else if (data.code == '202'){
					$.messager.alert(data.msg);
					  }
				else {
					$.messager.alert('系统提示', data.msg, "info");
					// 增加异常时，回调操作
					if (param.callerror) {
						param.callerror(data);
					}
				}
			} else {
				if (param.callback) {
					param.callback(data);
				}
			}
		}
	};
	
	// 当传入data为json对象时，将其转为字符串格式
	if (typeof param.data != "string") {
		param.data = $.toJSON(param.data);
	}
	
	if(param.url.indexOf(".action")!=-1 || param.url.indexOf(".jsp")!=-1){
		param.url = ajaxNameSpace + param.url;
	}else{
		param.url = ajaxNameSpace + param.url + ".action";
	}
	
	if(isEmpty(param.async)){
		param.async = false;
	}else{
		param.async = param.async;
	}	
	defautlParam = $.extend(defautlParam, param);
	$.ajax(defautlParam);
	
};

/**
 * form表单json to form，form to json
 */

ErpUtil.form = {
		setJson:function(panels, data){
			var $panel = $(panels),
				  elements = $panel.find("input[id],textarea[id]"),
				  formData = {};

			//将 json格式翻译成对应的key value	
			function getVal(json,parent){
				parent = parent || '';
				for(var i in json){
					if(typeof json[i] === 'object'){
						if(parent.length > 0){
							getVal(json[i], parent + '[' + i + ']');
						}else{
							getVal(json[i], i);
						}
					}else{
						if(parent){
							formData[parent + '[' + i + ']'] = json[i];
						}else{
							formData[i] = json[i];
						}
					}
				}
			}

			getVal(data);
			data = formData;
		
			// 设置input控件的值
			elements.each(function(i,item){
				if(!(data[item.id])){
					return;
				}
				var ele = $(item);
				if(ele.hasClass('con-show')){
					var next = ele.next();
					next.addClass('ui-readonly');
					next.find('.textbox-addon').hide();
					next.find('.textbox-text').attr('background-color', '#fff');
					next.find('.textbox-disabled').attr('background-color', '#fff');
					ele.addClass('ui-readonly').attr('readOnly', 'true');
				}
				if(ele.attr('type') === 'radio'){
					setRadioData($panel,item.id,data[item.id]);
				}
				if(ele.attr('type') === 'checkbox'){
					setCheckboxData($panel,item.id,data[item.id]);
				}
				if(ele.hasClass('numberbox-f')){
					ele.numberbox('setValue',data[item.id]);
					return;
				}
				if(ele.hasClass('datebox-f')){
					ele.datebox('setValue', data[item.id]);
					return;
				}
				if(ele.hasClass('combobox-f')){
					var opts = ele.combobox('options');
					if(opts["multiple"]){
					}else{
						ele.combobox('select', data[item.id]);
					}
					return;
				}
				if(ele.hasClass('combotree-f')){
					var opts = ele.combotree('options');
					if(opts["multiple"]){
						ele.combotree('setValues',data[item.id].split(","));
					}else{
						ele.combotree('setValue',data[item.id]);
					}
					return;
				}
				if(ele.hasClass('textbox-f')){
					ele.textbox('setText',data[item.id]).textbox('setValue',data[item.id]);
					return;
				}
				ele.val(data[item.id]);
			});


			function setRadioData(element, elName, value){
				element.find('[name="' + elName + '"]').each(function(){
					this.checked = (this.value === value);
				});
			}

			function setCheckboxData(element, elName, value){
				var $checkedEls = element.find('[name="' + elName + '"]'),
            		valueItems = value.split(',');

				$checkedEls.each(function() {
					this.checked = (valueItems.indexOf(this.value) !== -1);
				});
			}
		}
}

/**
 * 用于判断ajax是否执行完成
 */

//这边是对页面手机和对内容获取的值 这边是直接获取的对应的内容和值
ErpUtil.ajaxStatus = {
	//判断是否通过控件的验证 
	isValid : function(panels) {// 验证控件数值是否正确
		if(panels==undefined){
			ErpUtil.message.alert("友情提示。为了避免整个页面表单验证出错，开发人员请添加校验panel的div ID,如：ErpUtil.ajaxStatus.isValid('#divid')");
			//return false;
		}
		var $panel = ErpUtil.page.toJqueryObj(panels);
		// 根据类型循环
		
		var retValue = $panel.form("validate");
		
		/*$.each($panel.find(".combo-f"), function(i, item) {// 包括combox、datebox
			if (!$(item).combo('isValid')) {
				retValue = false;
			}
		});
		
		$.each($panel.find(".easyui-validatebox"), function(i, item) {
			if (!$(item).validatebox('isValid')) {
				retValue = false;
			}
		});
		// textbox的格式的校验
		$.each($panel.find(".easyui-textbox"), function(i, item) {
			if (!$(item).textbox('isValid')) {
				retValue = false;
			}
		});
		
		// 数字内容格式
		$.each($panel.find(".easyui-numberbox"), function(i, item) {
			if (!$(item).numberbox('isValid')) {
				retValue = false;
			}
		});
		*/
		if(!retValue){
			ErpUtil.message.alert('校验数据有误，请检查，前面带*为必填项，显示红色的输入项为数据有误。');
		};
		return retValue;
	},
	
	//搜集数据
	loadJson : function(panels) {
		
		var $panel = $(panels);
		var retJson = {};
		
		// 查询input选项
		$.each($panel.find("input[id],textarea[id]"), function(i, item) {
			if ($.data(item, "numberbox")) {// datebox控件
				retJson[item.id] = $(item).numberbox('getValue');
			} else if ($(item).hasClass("ui-money")) {// 当存在ui-money样式时,执行setValue前进行数据格式化
				retJson[item.id] = $(item).attr("percent") ? parseFloat(
						ErpUtil.stringUtil.moneyRevert($(item).val())).div(
						$(item).attr("percent")) : ErpUtil.stringUtil
						.moneyRevert($(item).val());
			} else {
				retJson[item.id] = $(item).val();
			}
		});
		// 查询下拉框选项
		$.each($panel.find(".combo-f"), function(i, item) {// 包括combox、datebox
			if (!$.data(item, "combo")) {
				return true;
			}
			if ($.data(item, "combo").options["multiple"] == true) {
				retJson[item.id] = $(item).combo('getValues').join(",");
				
			} else {
				retJson[item.id] = $(item).combo('getValue');
			}
			
			//retJson[item.id + "Name"] = $(item).combo('getText');
			retJson[item.id] = retJson[item.id] == undefined ? ""
					: retJson[item.id];
		});
		// 获取弹出窗口的值
		$.each($panel.find(".ui-combodialog"), function(i, item) {
			retJson[item.id] = $(item).combodialog('getValue');
			retJson[item.id + "Name"] = $(item).combodialog('getText');
		});

		return retJson;
	},
	
	setJson : function(panels, data,call) {
		var $panel = ErpUtil.page.toJqueryObj(panels);
		
		// 设置input控件的值
		
		setTimeout(function() { 
		$.each($panel.find("input[id],textarea[id]"), function(i, item) {
			if (data[item.id] == null) {
				$(item).val('');
				return true;
			}
			if($(item).hasClass("dict-input")){
				return true;
			}
			if ($(item).attr('type')=='radio') {
				return true;
			}
			if ($(item).attr('type')=='checkbox') {
				return true;
			}
			if ($.data(item, "numberbox")) {// datebox控件
				$(item).numberbox('setValue', data[item.id]);
				
			}else {
				var txt = ErpUtil.getDisplayText(item, data[item.id],
						data[item.id]);
				$(item).val(txt);
			}
		});
		
		// 设置textbox 
		$.each($panel.find(".easyui-textbox"), function(i, item) {
			if (data[item.id] == null) {
				$(item).textbox('setText','');
				$(item).textbox('setValue','');
			}
			
			
			$(item).textbox('setText',data[item.id]);
			$(item).textbox('setValue',data[item.id]);
		});
		// 设置combobox、datebox的值
		$.each($panel.find(".combo-f"), function(i, item) {
			if (!$.data(item, "combo") ) {
				
				return true;
			}
			if($(item).hasClass("notset")){
				return true;
			}
			if ($.data(item, "datebox")) {// datebox如果通过combo的setValue方法无法对text赋值
				if (data[item.id] == null) {
					$(item).datebox('setValue', '');
				};
				$(item).datebox('setValue', data[item.id]);
			} else {
				// 当combobox中的valueField = textField 时不需要再通过_name区分名称
				
				if ($.data(item, "combotree")) {
					var opts = $(item).combotree("options");
					
					
					if (opts["multiple"] == true) {
						if (data[item.id] == null) {
							//$(item).combotree('setValues', '');
							return true;
						};
						$(item).combotree('setValues',
										data[item.id].split(","));
						
					} else {
						if (data[item.id] == null) {
							$(item).combotree('setValue', '');
						};
						$(item).combotree('setValue', data[item.id]);
					}
				} else {
					var opts = $(item).combobox("options");
					
					if (opts["multiple"] == true) {//combobox 多选的情况
						//多选的情况特殊处理
						
						//$(item).combobox('setValues', data[item.id].split(","));
					} else {//combobox 单选的情况
						
						$(item).combobox('options');
						$(item).combobox('setValue', data[item.id]);
					}
				}
				if (opts.valueField && opts.textField
						&& opts.valueField == opts.textField) {
					$(item).combobox('setText', data[item.id]);
				} else {
					// var txt = data[item.id+'Name'] ==
					// null?"缺少下拉匹配的显示字段[Name]..":data[item.id+'Name'];
					var txt = ErpUtil.getDisplayText(item, data[item.id],
							data[item.id]);
					//$(item).combo('setText', txt);
				}
			}
		});
		$.each($panel.find(".con-show"), function(i, item) {
			$(item).next();
			$(item).next().addClass('ui-readonly');
			$(item).next().find('.textbox-addon').hide();
			$(item).next().find('.textbox-text').attr('background-color', '#fff');
			$(item).next().find('.textbox-disabled').attr('background-color', '#fff');
			$(item).addClass('ui-readonly').attr('readOnly', 'true');
			
		});
		if(call){
			call();
		}

		}, 10)
	},
	
	isOver : function() {// 判断ajax是否执行完成
		var count = 0;
		for ( var i in ErpUtil.ajaxStatus.status) {
			count++;
		}
		if (count == 0) {
			return true;
		} else {
			return false;
		}
	},
	clean : function() {
		ErpUtil.ajaxStatus.status = {};
	},
	showLoading : function() {// 显示进度栏
		if ($('.common-util-progress').length > 0) {
			return false;
		}
		var heights = Math.max($(document).height(), document.body.clientHeight);
		var widths = Math.max($(document).width(), document.body.clientWidth);
		var progress_panel = $(
				"<div class=\"datagrid-mask common-util-progress\" style=\"display:block\"></div>")
				.appendTo($('body').parent());
		progress_panel.css({
			height : heights,
			width : widths,
			"z-index" : 9999
		});
		var progress = $(
				"<div class=\"panel-loading common-util-progress\" style=\"display:block;font-size:12px;\"></div>")
				.html("loading.....").appendTo('body');
		progress.css({
			top : (heights / 2 - 5),
			left : (widths / 2 - 10),
			position : "absolute",
			"z-index" : 9999
		});
		$('.btn_div,.ajax_hid_div')
				.each(
						function(i, item) {
							var $item = $(item);
							var $btn_progress = $(
									"<div class=\"btn_progress common-util-progress\"></div>")
									.appendTo($item);
							$btn_progress.css({
								top : 0,
								left : 0,
								position : "absolute",
								height : $item.innerHeight(),
								width : $item.innerWidth()
							});
						});
	},
	hidLoading : function() {// 隐藏进度栏
		$('.common-util-progress').remove();
	},
	seriNoRandom : function() {
		return ErpUtil.dateUtil.getNowTime("ddhhmmss")
				+ parseInt(Math.random() * 10000 + 1);
	},
	status : {}
};



/**
 * 页面控制
 */
ErpUtil.page = {
	// PS:当出现打开同一页面时此处逻辑存在问题
	pageObject : {},// 用于记录页面init对象
	// 将传入区域转换jquery对象
	toJqueryObj : function(obj) {
		obj = obj || 'body';
		if (typeof obj == "string") {
			return $(obj);
		} else if (typeof obj == "object") {
			return obj;
		} else {
			ErpUtil.message.alert("[toJqueryObj]传入错误的转换类型.");
			return false;
		}
	},
	loadUrl : function(panels, urls, hasLoading) {
		var $panel = ErpUtil.page.toJqueryObj(panels);
		var seriNo = ErpUtil.ajaxStatus.seriNoRandom();
		$.ajax({
			url : urls,
			// cache : false,
			async:true,
			type : "POST",
			beforeSend : function(XMLHttpRequest) {
				if (hasLoading == true && ErpUtil.ajaxStatus.isOver()) {
					ErpUtil.ajaxStatus.status[seriNo] = seriNo;
					ErpUtil.ajaxStatus.showLoading();
				}
			},
			complete : function(XMLHttpRequest) {
				delete ErpUtil.ajaxStatus.status[seriNo];
				if (ErpUtil.ajaxStatus.isOver()) {
					ErpUtil.ajaxStatus.hidLoading();
				}
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				ErpUtil.ajaxStatus.hidLoading();
				ErpUtil.ajaxStatus.clean();
				$panel.html($("<div class=\"panel-loading\"></div>").html(
						"loading error"));
			},
			success : function(html_info) {
				// 异常时，返回错误对象
				if (typeof html_info == 'object') {
					$panel.html(html_info.msg);
					ErpUtil.page.reloadUI($panel);
					return ErpUtil.message.alert(html_info.msg);
				}
				$panel.html(html_info);
				ErpUtil.page.reloadUI($panel);
				// 记录加载过的页面对象
				var objName = ErpUtil.page.setPageObject(urls);
				//判断types是存在的
				if(!isEmpty(objName.types)){
					if (ErpUtil.page.dialogParam(objName, 'types') == 'detail') {
						ErpUtil.page.pageDetail(panels);
					}
					if (ErpUtil.page.dialogParam(objName, 'types') == 'add') {
						ErpUtil.page.pageAddDetail(panels);
					}
				}
			}
		});
	},
	//如果是新增页面,就执行下面代码
	pageAddDetail:function(panels){
		var $panel = ErpUtil.page.toJqueryObj(panels);
		if ($.parser) {
			$.parser.parse($panel);
		}// 重新渲染页面控件
		//con-show 的内容显示系统生成
		$.each($panel.find(".con-show"), function(i, item) {
			$(item).textbox({    
				prompt:'系统生成'  
			});
			$(item).next();
			$(item).next().find('.textbox-addon').hide();
			$(item).next().find('.textbox-text').attr('background-color', '#f5f5f5');
			$(item).next().attr('background-color', '#f5f5f5');
			$(item).addClass('ui-readonly').attr('readOnly', 'true');
		});
		
	},
	reloadUI : function(panels) {
		
		
		var $panel = ErpUtil.page.toJqueryObj(panels);
		if ($.parser) {
			$.parser.parse($panel);
		}// 重新渲染页面控件
		
		
		
		// 1.字典控件赋值
		$.each($panel.find('.easyui-combobox[type=dict]'), function(i, item) {

			var $item = $(item);
			var dict_id = $item.attr("dict");
			var dict_folder = $item.attr("folder");
			
			
			//把下拉选项和字典项的内容都提取出来，会自动去加载内容
			
			var list = new Array();
			if (ErpUtil.stringUtil.isNull(dict_folder)) {
				
				list = ErpUtil.page.dictList(dict_id);
			} else {
				// 存在dict_folder时，从后台读取子类数据
				$item.combobox({
		  			width:"90%",
		  			valueField: 'value',
		  			textField: 'text',
		  			data: ErpUtil.dictInfo.PropertyType
		  		});
				
				ErpUtil.ajax({
					url : "/DictController/searchDictItemByDictFolder",
					data : {
						"dict_id" : dict_id,
						"dict_folder" : dict_folder
					},
					async : false,
					callback : function(data) {
						list = data;
					}
				});
			}
			
			// 当控件hasNull="true"时，插入“请选中”项
			if ($item.attr('hasNull') == true
					|| $item.attr('hasNull') == "true") {
				list.splice(0, 0, {
					value : "",
					text : "--全部--"
				});
			} else if ($item.attr('hasNull') == false
					|| $item.attr('hasNull') == "false") {
				list.splice(0, 0, {
					value : "",
					text : "--请选择--"
				});
			} else if ($item.attr('hasNull') == "null") {
				list.splice(0, 0, {
					value : "",
					text : ""
				});
			}
			if (list.length > 0) {
				$item.combobox('loadData', list);
			}
				
			// 存在默认值时
			if (!ErpUtil.stringUtil.isNull($item.attr('default'))) {
				$item.combobox('select', $item.attr('default'));
			}
			;
		});

		// 2.控件加载完成后，对class=table_panel的表格增加样式
		$panel.find('.table_panel').attr('cellspacing', '0').attr(
				'cellpadding', '0');
		// 逻辑：宽度自动计算方法。根据table_panel中第一行中的td的个数进行判断。自动计算宽度
		$panel.find('.table_panel').each(
				function(i, item) {
					var $item = $(item);
					var td_count = $item.find('tr:first td').length;
					switch (td_count) {
					case 2:
						$item.find('tr td:even').addClass('label_td').css(
								'width', '25%');
						$item.find('tr td:odd').addClass('input_td').css(
								'width', '75%');
						break;
					case 4:
						$item.find('tr td:even').css('width', '20%').addClass(
								'label_td');
						$item.find('tr td:odd').css('width', '30%').addClass(
								'input_td');
						$item.find('tr td[colspan=3]').css('width', '80%');// 出现单元格合并时宽度样式不会出错
						break;
					case 6:
						$item.find('tr td:even').addClass('label_td').css(
								'width', '13%');
						$item.find('tr td:odd').addClass('input_td').css(
								'width', '20%');
						$item.find('tr td[colspan=3]').css('width', '43%');
						$item.find('tr td[colspan=5]').css('width', '76%');
						break;
					case 8:
						$item.find('tr td:even').addClass('label_td').css(
								'width', '10%');
						$item.find('tr td:odd').addClass('input_td').css(
								'width', '15%');
						$item.find('tr td[colspan=3]').css('width', '40%');
						$item.find('tr td[colspan=5]').css('width', '65%');
						$item.find('tr td[colspan=7]').css('width', '90%');
						break;
					}
					;
				});
		// 逻辑：class="red-star" 在标签最后添加红色 ×
		$panel.find('.red-star').prepend("<font color='red'>*</font>");

		// 逻辑：所有class=ui-money的input控件增加blur 事件与focus事件
		$panel.find('.ui-money').blur(function() {
			$(this).val(ErpUtil.stringUtil.moneyFormat($(this).val()));
		}).focus(function() {
			$(this).val(ErpUtil.stringUtil.moneyRevert($(this).val()));
		});
		
		// 逻辑：对页面上的input控件增加tip显示
		$panel.find('.ui-show,.ui-readonly').mouseover(function() {
			ErpUtil.page.showTips($(this), $(this).val());
		}).mouseleave(function() {
			ErpUtil.page.hideTips();
		});
	},
	reloadSearchUI : function(panels) {
		var $panel = ErpUtil.page.toJqueryObj(panels);
		if ($.parser) {
			$.parser.parse($panel);
		}// 重新渲染页面控件
		
		// 1.字典控件赋值
		$.each($panel.find('.easyui-combobox'), function(i, item) {
			var $item = $(item);
			//debugger;
			//当是easyui-combobox的时候加上
			var defaultData = {};
	        var vf = $item.combobox('options').valueField;
	        var tf = $item.combobox('options').textField;
	       
	        defaultData[vf] = null;
	        defaultData[tf] = '请选择';
	       
	        var data = $item.combobox('options').data;
	        
	        data.splice(0,0,defaultData)
	        //加上默认值后，重载数据
			$item.combobox('loadData',data);
	        	
			// 存在默认值时
			if (!ErpUtil.stringUtil.isNull($item.attr('default'))) {
				$item.combobox('select', $item.attr('default'));
			}
			;
		});
	},
	//显示隐藏列内容，第一个参数是传入对应table id.第二个参数是传入页面变量
	showColumn: function(panels,pageVar) {
		if(panels==undefined){
			ErpUtil.message.alert("隐藏页面，第一个传入的是table的id，后面传入的页面参数变量");
			//return false;
		}
		var $panel = ErpUtil.page.toJqueryObj(panels);
		// 根据类型循环
		console.log($panel);
		console.log(pageVar);
		//把html插入到页面内容中去。
		var hideComboboxHtml ='<div class="grid_table_column" style=""><span>选中隐藏列:</span><input class="grid_table_column_combobox" ></div>';
		$panel.append(hideComboboxHtml);
		
		var pageDatagrid = $panel.find('#grid_table');
		
		$panel.find('#grid_table').datagrid('getColumnFields')
		 var grid_table_column = $panel.find('#grid_table').datagrid('getColumnFields');
		 var grid_table_column_combobox_data =[];
			//去到对应的列表
		 for(var i= 0;i<grid_table_column.length;i++){
				var grid_table_column_option = $panel.find('#grid_table').datagrid('getColumnOption',grid_table_column[i]);
			 	if(grid_table_column_option.hidden!=true && grid_table_column_option.hidden!='true'){
					grid_table_column_combobox_data.push(grid_table_column_option);
				}
			}
			//grid_table_column_combobox_data.pop();
			$panel.find(".grid_table_column_combobox").combobox({ 
				data:grid_table_column_combobox_data ,
				valueField: 'field',    
		        textField: 'title',
		        multiple:true,
		        onSelect:function(record){
		        	$panel.find('#grid_table').datagrid('hideColumn',record.field);
		        	var hideColumnArr = store.get(pageVar);
		        	if(isEmpty(hideColumnArr)){
		        		hideColumnArr =[]
		        		hideColumnArr.push(record.field);
		        		
		        	}else{
		        		hideColumnArr.push(record.field);
		        	};
		        	
		        	$panel.find('#grid_table').datagrid('resize',{width:'100%'});    
		        	store.set(pageVar, hideColumnArr);
		        },
		        onUnselect:function(record){
		        	$panel.find('#grid_table').datagrid('showColumn',record.field);
		        	var hideColumnArr = store.get(pageVar);
		        	hideColumnArr.remove(record.field);
		        	
		        	$panel.find('#grid_table').datagrid('resize',{width:'100%'});    
		        	store.set(pageVar, hideColumnArr);
		        }
			}); 
			
			var hideColumnArr = store.get(pageVar);
			
			if(!isEmpty(hideColumnArr)){
				//给combobox赋值
				$panel.find(".grid_table_column_combobox").combobox('setValues',hideColumnArr);
				//隐藏内容
				for(var i =0;i<hideColumnArr.length;i++){
					$panel.find('#grid_table').datagrid('hideColumn',hideColumnArr[i]);
					console.log("----")
					  
					$panel.find('#grid_table').datagrid('resize',{width:'100%'});       
					//$panel.find(".grid_table_column_combobox").datagrid('hideColumn',hideColumnArr[i]);
				}
			} 
	},
	
	
	clearPage : function() {
		// 菜单切换时清空已加载过的页面对象
		ErpUtil.page.pageObject = {};
	},
	setPageObject : function(url) {
		var urlList = url.split('?');
		var paramNames = urlList[0].split('/');
		var paramName = paramNames[paramNames.length - 1];
		var objName = paramName.split(".")[0];
		ErpUtil.page.pageObject[objName] = ErpUtil.page
				.getUrlParamInfo(url);
		return objName;
	},
	getUrlParamInfo : function(url) {
		var urlList = url.split('?');
		if (urlList.length > 1) {
			var paramString = urlList[1];
			var obj = {};
			$.each(paramString.split("&"), function(i, item) {
				var items = item.split('=');
				obj[items[0]] = items[1];
			});
			return obj;
		} else {
			return null;
		}
	},
	showTipsController : null,// 字段超长时数据标签
	showTips : function(obj, msg) {
		if (typeof msg != "string") {
			return false;
		}
		var msgBit = msg.replace(/[^\x00-\xff]/g, '\r\n').split('');
		if (ErpUtil.stringUtil.isNull(msg) || msgBit.length < 20) {
			return false;
		}
		if (ErpUtil.stringUtil.isNull(ErpUtil.page.showTipsController)) {
			ErpUtil.page.showTipsController = $(
					"<div class=\"controller-tip\">"
							+ "<span class=\"controller-tip-point\"></span>"
							+ "<span class=\"controller-tip-content\"></span>"
							+ "</div>").appendTo("body");
		}
		ErpUtil.page.showTipsController.find(".controller-tip-content")
				.html(msg);
		if (obj.hasClass("ui-money")) {
			ErpUtil.page.showTipsController.css(
					{
						display : "block",
						left : obj.offset().left + obj.width()
								- ErpUtil.showTipsController.width(),
						top : obj.offset().top + obj.outerHeight()
					}).show();
		} else {
			ErpUtil.page.showTipsController.css({
				display : "block",
				left : obj.offset().left,
				top : obj.offset().top + obj.outerHeight()
			}).show();
		}
	},
	hideTips : function() {
		if (ErpUtil.page.showTipsController) {
			ErpUtil.page.showTipsController.hide();
		}
	},
	// 弹出页面dialog
	dialogList : [],// 记录dialog对象，用于实现回调参数传递
	//这边弹窗的内容就是条用了这个方法了的
	dialog : function(otps) {
		if (typeof (otps) == "string") {
			return alert('参数类型不正确.');
		}
		function createDialog(params) {
			if (!params.urls) {
				return alert("缺少关键参数urls");
			}
			// 逻辑：增加逻辑在传入url上增加__moduleid参数
			if (params.urls.split("?").length > 1) {
				params.urls += '&__module_id=' + ErpUtil.pageModuleIdForPage;
			} else {
				params.urls += '?__module_id=' + ErpUtil.pageModuleIdForPage;
			}
			var bodyHeight = $('body').innerHeight();
			if (otps.height > bodyHeight) {
				otps.height = bodyHeight;
			}
			var id = "dialog_" + Math.floor(Math.random() * 1000);

			if(params.divid!=null){
				id=params.divid;
			}

			// class=common-dailog用于标记当前弹出窗口页面。在子页面中可以根据该字段关闭dailog
			$(
					'<div id="'
							+ id
							+ "_div"
							+ '" class="common-dialog"><div id="'
							+ id
							+ "_panel"
							+ '" style="padding:5px;height:100%;width:100%;"></div></div>')
					.appendTo(document.body);
			params.onClose = function() {
				clearElem();
				if (params.onCloseed) {
					ErpUtil.page.dialogList.pop();
					params.onCloseed();
				}
			};
			params.onResize = function() {
				// 当改变dialog的大小时，dialog内的panel需要重新resize
				$("#" + id + "_panel .easyui-panel").panel('resize');
			};
			ErpUtil.page.setPageObject(params.urls);
			$("#" + id + "_div").dialog(params);
			$("#" + id + "_panel").panel(
					{
						fit : true,
						cache : false,
						onOpen : function() {
							ErpUtil.page.loadUrl("#" + id + "_panel",
									params.urls, true);
						}
					});
			this.closes = function(obj) {
				if (params.onCloseed) {
					params.onCloseed(obj);
				}
				clearElem();
			};
			function clearElem() {
				$("#" + id + "_div").find("iframe").remove();
				ErpUtil.page.removeEasyUI("#" + id + "_panel");// 加载新页面前，移除原有控件
				$("#" + id + "_panel").children().remove();
				$("#" + id + "_div").dialog('destroy');
			}
			;
		}
		var ret = new createDialog(otps);
		// 添加dialog对象添加到数组中
		ErpUtil.page.dialogList.push(ret);
		
		return ret;
	},
	closedailog : function(obj) {
		// 在dialog数组中移除当前打开的dialog
		var dialogObj = ErpUtil.page.dialogList.pop();				
		if(dialogObj)
		dialogObj.closes(obj);
	},
	dialogParam : function(objName, name) {// 读取页面参数
		if (ErpUtil.page.pageObject[objName] && !name) {
			return ErpUtil.page.pageObject[objName];
		} else {
			return ErpUtil.page.pageObject[objName][name];
		}
	},
	pageDetail : function(panels, callback) {
		var $panel = ErpUtil.page.toJqueryObj(panels);
		// 防止重复执行该命令.当容器的父节点存在types=detail的属性时，不再执行该方法
		if ($panel.attr("types") == "detail"
				|| $panel.parents("[types='detail']").length > 0) {
			return;
		}
		$.each($panel.find(".con-show"), function(i, item) {
			$(item).next();
			$(item).next().addClass('ui-readonly');
			$(item).next().find('.textbox-addon').hide();
			$(item).next().find('.textbox-text').attr('background-color', '#fff');
			$(item).next().find('.textbox-disabled').attr('background-color', '#fff');
			$(item).addClass('ui-readonly').attr('readOnly', 'true');
		});
		// 查询input选项
		$.each($panel.find("input[id]:not(.ui-eternal)"), function(i,
				item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			var itemType =  $(item).attr('type');
			if(itemType=='radio' || itemType=='checkbox'){
				
				$(item).addClass('ui-readonly').attr('disabled', 'true');
			}
				$(item).addClass('ui-readonly').attr('readOnly', 'true');
		});
		// 查询input选项
		$.each($panel.find("input[type=radio]"), function(i,
				item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			
			
				$(item).addClass('ui-readonly').attr('disabled', 'true');
			
				$(item).addClass('ui-readonly').attr('readOnly', 'true');
		});
		// 查询input选项
		$.each($panel.find("input[type=checkbox]"), function(i,
				item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			
			
				$(item).addClass('ui-readonly').attr('disabled', 'true');
			
				$(item).addClass('ui-readonly').attr('readOnly', 'true');
		});
		
		
		//查询textbox选项
		$.each($panel.find(".easyui-textbox"), function(i,
				item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			$(item).textbox({
				readonly:true
			});
			$(item).next();
			$(item).next().addClass('ui-readonly');
			$(item).next().find('textbox-text').attr('readOnly', 'true')
			$(item).addClass('ui-readonly').attr('readOnly', 'true');
			
		});
		//numberbox-f 
		$.each($panel.find(".numberbox-f"), function(i,
				item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			$(item).numberbox({
				readonly:true
			});
			$(item).next().addClass('ui-readonly');
			$(item).next().find('textbox-text').attr('readOnly', 'true')
			$(item).addClass('ui-readonly').attr('readOnly', 'true');
		});
		//datebox-f 
		$.each($panel.find(".datebox-f"), function(i,
				item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			$(item).next().addClass('ui-readonly');
			$(item).next().find(".textbox-addon").hide();
			$(item).next().find('textbox-text').attr('readOnly', 'true')
			$(item).addClass('ui-readonly').attr('readOnly', 'true');
		});
		
		// 查询textarea选项
		$.each($panel.find("textarea[id]"), function(i, item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			$(item).addClass('ui-readonly').attr('readOnly', 'true');
			
		});
		//easyui-combobox
		$.each($panel.find(".combobox-f"), function(i, item) {
		//tab页面的列表页面 显示栏目和隐藏栏目详情页 不去变化
			if ($(item).attr("id")=='grid_table_column_combobox') {
				return;
			}
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			
			$(item).combobox("disable");
			$(item).next().addClass('ui-readonly');
			$(item).next().find(".textbox-addon").hide();
			$(item).next().find("input").addClass('ui-readonly');
			
		});
		
		//easyui-combotree
		$.each($panel.find(".combotree-f "), function(i, item) {
			
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
			$(item).combobox("disable");
			$(item).next().addClass('ui-readonly');
			$(item).next().find(".textbox-addon").hide();
			$(item).next().find("input").addClass('ui-readonly');
			
		});
		
		// 隐藏控件
		$panel.find(".easyui-linkbutton:not(.ui-eternal)").hide();
		// easyui中check的事件控制
		$.each($panel.find(".tree-checkbox"), function(i, item) {
			if ($(item).data("events")) {// 在每个对象的缓存中记录jquery事件
				ErpUtil.page.fnRemove(item);
			}
		});
		// 获取弹出窗口的值
		$.each($panel.find(".ui-combodialog"), function(i, item) {
			$(item).combodialog('setDisable');
		});
		// 网格编辑按钮
		$panel.find(".datagrid-toolbar").hide();
		// 按钮隐藏
		$panel.find(".mod_manage_button").hide();
		 
		if (callback) {
			callback(panels);
		}
	},
	fnRemove : function(item) {
		$.data(item, "jbind", jQuery.extend(true, {}, {
			"jbind" : $(item).data("events")
		}));
		$(item).unbind("click").unbind("focus").unbind("blur")
				.unbind("keydown").unbind("keyup").unbind("mousedown").unbind(
						"mouseout").unbind("mouseover");
	},
	setDisable : function(obj) {// 设置控件为不可用
		if (!ErpUtil.ajaxStatus.isOver()) {
			window.setTimeout(function() {
				ErpUtil.page.setDisable(obj);
			}, 300);
			return;
		}
		var $obj = ErpUtil.page.toJqueryObj(obj);

		if ($obj.hasClass("easyui-validatebox")) {
			$obj.removeClass("easyui-validatebox").addClass(
					'detail-easyui-validatebox');
		}

		if ($obj.hasClass("combo-f")) {
			var span = $obj.next();
			span.addClass('ui-readonly');
			span.find('span').hide();
			span.find('.combo-text').attr('readOnly', 'readOnly').addClass(
					'ui-readonly');
		} else if ($obj.hasClass("ui-input")) {
			$obj.attr('readOnly', 'readOnly').addClass('ui-show');
		}
	},
	setEnable : function(obj) {// 将被禁用的控件还原为可用
		if (!ErpUtil.ajaxStatus.isOver()) {
			window.setTimeout(function() {
				ErpUtil.page.setEnable(obj);
			}, 300);
			return;
		}
		var $obj = ErpUtil.page.toJqueryObj(obj);
		if ($obj.hasClass("detail-easyui-validatebox")) {
			$obj.removeClass("detail-easyui-validatebox").addClass(
					'easyui-validatebox');
		}

		if ($obj.hasClass("combo-f")) {
			var span = $obj.next();
			span.removeClass('ui-readonly');
			span.find('span').show();
			span.find('.combo-text').removeAttr('readOnly', 'readOnly')
					.removeClass('ui-readonly');
			if (span.hasClass("detail-span-combo")) {
				span.addClass('combo').removeClass('detail-span-combo');
			}
		} else if ($obj.hasClass("detail-input-no-readOnly")) {
			$obj.removeAttr('readOnly').removeClass('detail-input-no-readOnly')
					.removeClass('ui-readonly');
		} else if ($obj.hasClass("ui-show")) {
			$obj.removeAttr('readOnly').removeClass('ui-show').addClass(
					'ui-input');
		}
	},
	removeEasyUI : function(panels) {
		// 记录下所有需要执行destroy的语句，最后统一执行，不能每次都执行，否则会倒是数据异常
		var execList = new Array();
		$.each(ErpUtil.easyControls, function(i, info) {
			var controlName = info.replace("easyui-", "").replace("-f", "");
			var strFun = "$('" + panels + " ." + info + "')." + controlName
					+ "('destroy')";
			execList.push(strFun);
		});
		// 执行控件的destroy方法
		$.each(execList, function(i, str) {
			eval(str);
		});
	},
	fileUpLoad : function(options) {
		function init(opts) {
			var $panel = ErpUtil.page.toJqueryObj(opts.panels);
			// 创建上传按钮
			var $upload_btn = $('<a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add">文件上传</a>');
			$upload_btn.click(uploadClick);
			$panel.append($upload_btn);
			// 文件列表
			var $file_list_panel = $('<div class="file_list_panel" style="padding:5px;"></div>');
			$file_list_panel.appendTo($panel);
			var $downform, $form = null;
			function imgIcon(file_name) {
				var nameList = file_name.split(".");
				var nameStr = nameList[nameList.length - 1];
				if (jQuery.inArray(nameStr, [ "xls", "xlsx" ]) > -1) {
					return "icon-excel";
				} else if (jQuery.inArray(nameStr, [ "doc", "docx" ]) > -1) {
					return "icon-word";
				} else if (jQuery.inArray(nameStr, [ "png", "jpg", "jpeg",
						"gif", "bmp" ]) > -1) {
					return "icon-picture";
				} else {
					return "icon-picture";
				}
				return "";
			}

			function createImg(imgOpts) {
				if (!imgOpts) {
					return false;
				}
				var $imgDiv = $("<div class=\"img_file "
						+ imgIcon(imgOpts.file_name)
						+ "\" file_src=\""
						+ imgOpts.file_src
						+ "\" file_path=\""
						+ imgOpts.file_path
						+ "\" edit_types=\""
						+ imgOpts.edit_types
						+ "\" file_name=\""
						+ imgOpts.file_name
						+ "\" style=\"padding-left: 20px;position:relative;line-height:15px;height:18px;\" ></div>");
				$imgDiv.appendTo($file_list_panel);
				var $imgSpan = $("<span style=\"cursor:hand;\">"
						+ imgOpts.file_name + "</span>");
				$imgSpan.appendTo($imgDiv);
				var $removeDiv = $("<div class=\"icon-cancel\" style=\"position:absolute;width:16px;height:16px;top:0px;right:5px;cursor:hand;\"></div>");
				$removeDiv.appendTo($imgDiv);
				$imgSpan
						.unbind("click")
						.click(
								function() {
									// 创建iframe
									var $iframe = $('<iframe id="iframe_down" name="iframe_down" style="display:none;"></iframe>');
									$panel.append($iframe);
									// 渲染
									$iframe
											.load(function() {
												var obj = $
														.parseJSON($iframe[0].contentWindow.document.body.innerHTML);
												if (!obj) {
													return false;
												}
												if (obj.status == "error") {
													$.messager.alert('提示信息',
															obj.msg);
												}
												$iframe.remove();
											});
									// 文件下载form
									$downform = $('<form action="'
											+ ErpUtil.downAction
											+ '" enctype="application/x-www-form-urlencoded" method="post"><input id="file_src" type="hidden" name="file_src" value="" /><input id="file_name" type="hidden" name="file_name" value="" /><input id="edit_types" type="hidden" name="edit_types" value="" /><input id="file_path" type="hidden" name="file_path" value="" /></form>');
									try {// 此方法在IE8下出现没有权限的问题，容后解决
										$downform.appendTo($iframe);
									} catch (e) {
									}
									$downform.find('#file_name').val(
											encodeURI(imgOpts.file_name));
									$downform.find('#file_src').val(
											encodeURI(imgOpts.file_src));
									$downform.find('#file_path').val(
											encodeURI(imgOpts.file_path));
									$downform.find('#edit_types').val(
											imgOpts.edit_types);
									$downform.submit().remove();
								});
				$removeDiv.unbind("click").click(function() {
					$.messager.confirm("提示信息", "确认删除该附件吗?", function(r) {
						if (r) {
							$imgDiv.remove();
							judgeCount();
							if (opts.onRemove) {
								opts.onRemove(imgOpts);
							}
						}
					});
				});
				judgeCount();
				if (opts.onUpLoad) {
					opts.onUpLoad(imgOpts);
				}
			}
			;

			// 控制上传文件数量
			function judgeCount() {
				if (opts.count == $file_list_panel.find('.img_file').length) {
					$upload_btn.linkbutton('disable').unbind("click");
				} else {
					$upload_btn.linkbutton('enable').unbind("click").click(
							uploadClick);
				}
			}

			// 将函数独立出来，方便解除click绑定方法
			function uploadClick() {
				// 创建iframe
				var $iframe = $('<iframe id="iframe_upload" name="iframe_upload" style="display:none;"></iframe>');
				$panel.append($iframe);
				// 渲染
				$iframe
						.load(function() {
							var obj = $
									.parseJSON($iframe[0].contentWindow.document.body.innerHTML);
							if (!obj) {
								return false;
							}
							if (obj.status == "succ") {
								if (obj.file_list) {
									$.each(obj.file_list, function(i, file) {
										createImg(file);
									});
								}
							} else {
								$.messager.alert('提示信息', obj.msg);
							}
							$iframe.remove();
						});
				$form = $('<form accept="*/*" method="post" target="iframe_upload" encoding="multipart/form-data" enctype="multipart/form-data" action="'
						+ ErpUtil.ajaxNameSpace + opts.url + '"></form>');
				var $file_upload = $('<input name="file1" id="file1" type="file" />');
				$form.append($file_upload);
				try {
					$form.appendTo($iframe);
				} catch (e) {
				}
				$file_upload.change(function() {
					$form.submit();
				});
				$file_upload.click();
			};

			// 接口:读取img数组对象
			this.getImgList = function() {
				var array = new Array();
				$panel.find('.img_file').each(function(i, item) {
					array.push({
						file_src : $(item).attr("file_src"),
						edit_types : $(item).attr("edit_types"),
						file_name : $(item).attr("file_name"),
						file_path : $(item).attr("file_path")
					});
				});
				return array;
			};
			// 接口:设置img数组对象(通过此方法设置的img对象edit_types = edit)
			this.setImgList = function(imgList) {
				if (ErpUtil.stringUtil.isNull(imgList)) {
					return false;
				}
				if (typeof imgList == "string") {
					imgList = $.parseJSON(imgList);
				}
				$.each(imgList, function(i, item) {
					item.edit_types = "edit";
					createImg(item);
				});
			};
		}
		return new init(options);
	},
	// 字典项
	dictText : function(dict_id, dict_key) {
		var retValue = dict_key;
		if (ErpUtil.dictInfo[dict_id]) {
			if (ErpUtil.dictInfo[dict_id][dict_key]) {
				retValue = ErpUtil.dictInfo[dict_id][dict_key];
			}
		} else {
			$.messager.alert('提示信息', '字典项 [' + dict_id + '] 不存在。');
		}
		return retValue;
	},
	dictList : function(dict_id, dict_folder) {
		var retList = new Array();
		if (dict_folder && !ErpUtil.stringUtil.isNull(dict_folder)) {
			// 存在dict_folder时，从后台读取子类数据
			ErpUtil.ajax({
				url : "/DictController/searchDictItemByDictFolder",
				data : {
					"dict_id" : dict_id,
					"dict_folder" : dict_folder
				},
				async : false,
				callback : function(data) {
					retList = data;
				}
			});
		} else {
			if (ErpUtil.dictInfo[dict_id]) {
				for ( var key in ErpUtil.dictInfo[dict_id]) {
					var dict_info = {
						"value" : key,
						"text" : ErpUtil.dictInfo[dict_id][key]
					};
					retList.push(dict_info);
				}
			}
		}
		return retList;
	}
};



/**
 * 数组先关函数
 */
ErpUtil.list = {
	addCheckItem : function(list) {
		var cloneInfo = {};
		$.extend(cloneInfo, list[0]);
		$.each(cloneInfo, function(key, txt) {
			cloneInfo[key] = "";
		});
		list.splice(0, 0, cloneInfo);
		return list;
	}
};


/** 删除数组中指定索引的数据 **/
Array.prototype.remove = function(b) { 
	var a = this.indexOf(b); 
	if (a >= 0) { 
	this.splice(a, 1); 
	return true; 
	} 
	return false; 
}; 
	
	
Array.prototype.deleteAt = function (index) {
    if (index < 0) {
        return this;
    }
    return this.slice(0, index).concat(this.slice(index + 1, this.length));
}
/** 数组洗牌 **/
Array.prototype.random = function () {
    var tempArr = [], me = this, t;
    while (me.length > 0) {
        t = Math.floor(Math.random() * me.length);
        tempArr[tempArr.length] = me[t];
        me = me.deleteAt(t);
    }
    return tempArr;
}
Array.prototype.orderRandom = function () {
    return this.sort(function () {
        return Math.random() > 0.5 ? "-1" : "1";
    });
}
/** 数字数组排序 **/
Array.prototype.sortNum = function (i) {
    if (!i) {
        i = 0;
    }
    if (i == 1) {
        return this.sort(function (a, b) {
            return b - a;
        });
    }
    return this.sort(function (a, b) {
        return a - b;
    });
}
/** 获取数字数组中的最大项 **/
Array.prototype.getMax = function () {
    return this.sortNum(1)[0];
}
/** 获取数字数组中的最小项 **/
Array.prototype.getMin = function () {
    return this.sortNum(0)[0];
}
/** 数组第一次出现指定元素的位置 **/
Array.prototype.indexOf = function (o) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == o) {
            return i;
        }
    }
    return -1;
}
/** 去除数组中的重复项 **/
Array.prototype.arrUnique = function () {
    var reset = [], done = {};
    for (var i = 0; i < this.length; i++) {
        var temp = this[i];
        if (!done[temp]) {
            done[temp] = true;
            reset.push(temp);
        }
    }
    return reset;
}

/**
 * 日期相关函数
 */
ErpUtil.dateUtil = {
	getNowDate : function(formater) {
		var d = new Date();
		if (formater) {
			return d.format(formater);
		} else {
			return d.format("yyyy-MM-dd");
		}
	},
	// 取得当天日期
	getNowTime : function(formater) {
		var d = new Date();
		if (formater) {
			return d.format(formater);
		} else {
			return d.format("yyyy-MM-dd hh:mm:ss");
		}
	},
	// 字符串转成Time(dateDiff)所需方法
	stringToTime : function(string) {
		var f = string.split(' ', 2);
		var d = (f[0] ? f[0] : '').split('-', 3);
		var t = (f[1] ? f[1] : '').split(':', 3);
		return (new Date(parseInt(d[0], 10) || null,
				(parseInt(d[1], 10) || 1) - 1, parseInt(d[2], 10) || null,
				parseInt(t[0], 10) || null, parseInt(t[1], 10) || null,
				parseInt(t[2], 10) || null)).getTime();

	},
	/**
	 * 日期相减函数
	 * 
	 * @param date1
	 * @param date2
	 * @returns {Number}
	 */
	dateDiff : function(date1, date2) {
		var type1 = typeof date1, type2 = typeof date2;
		if (type1 == 'string')
			date1 = ErpUtil.dateUtil.stringToTime(date1);
		else if (date1.getTime)
			date1 = date1.getTime();
		if (type2 == 'string')
			date2 = ErpUtil.dateUtil.stringToTime(date2);
		else if (date2.getTime)
			date2 = date2.getTime();
		// alert((date1 - date2) / (1000*60*60));
		return (date1 - date2) / (1000 * 60 * 60 * 24); // 结果是小时
	},
	// 获取业务日期
	getBizDate : function(formater) {
		if (formater) {
			var dateInfo = new Date(Date.parse(ErpUtil.bizDate.replace(/-/g,
					"/")));
			return dateInfo.format(formater);
		}
		return ErpUtil.bizDate;
	},
	/**
	 * 
	 * var dt = new Date(); //加天. var newDate = DateAdd( "d ",5,dt );
	 * alert(newDate.toLocaleDateString()) //加月. newDate = DateAdd( "m ",2,now);
	 * alert(newDate.toLocaleDateString()) //加年 newDate = DateAdd( "y ",1,now);
	 * alert(newDate.toLocaleDateString())
	 * 
	 * @param interval
	 * @param number
	 * @param date
	 */
	dateMath : function(interval, number, iptDate) {
		var arys = iptDate.split('-');
		var date = new Date(arys[0], arys[1] - 1, arys[2]);
		if (interval == "y") {
			date.setFullYear(parseInt(date.getFullYear()) + parseInt(number));
		} else if (interval == "q") {
			date.setMonth(parseInt(date.getMonth()) + parseInt(number * 3));
		} else if (interval == "m") {
			date.setMonth(parseInt(date.getMonth()) + parseInt(number));
		} else if (interval == "w") {
			date.setDate(parseInt(date.getDate()) + parseInt(number * 7));
		} else if (interval == "d") {
			date.setDate(parseInt(date.getDate()) + parseInt(number));
		} else if (interval == "h") {
			date.setHours(parseInt(date.getHours()) + parseInt(number));
		} else if (interval == "M") {
			date.setMinutes(parseInt(date.getMinutes()) + parseInt(number));
		} else if (interval == "s") {
			date.setSeconds(parseInt(date.getSeconds()) + parseInt(number));
		} else {
			date.setDate(parseInt(d.getDate()) + parseInt(number));
		}
		return date.format("yyyy-MM-dd");
	}
};
/**
 * 获取字典项的值
 */
ErpUtil.getDisplayText = function(target, value, defaultText) {
	if (!target) {
		return "";
	}
	var key = target;
	if (typeof target === "object") {
		key = $(target).attr("dictKey");
		key = key || target.id;
	}

	var dict = ErpUtil.dictInfo[key];
	if (!dict) {
		return defaultText;
	}
	for ( var i = 0; i < dict.length; i++) {
		var item = dict[i];
		if (item.value === value) {
			return item.text;
		}
	}
	return defaultText;
}

/**
 * 字符串相关函数
 */
ErpUtil.stringUtil = {
	isNull : function(obj) {
		if (obj == null || typeof (obj) == 'undefind' || obj.toString() == ""
				|| obj.toString() == "null" || obj.toString() == "NaN") {
			return true;
		}
		return false;
	},
	// 小数位格式化
	fomatFloat : function(src, pos) {
		var float = Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
		return float.toFixed(pos);
	},
	// 金额格式化
	moneyFormat : function(val, pos) {
		if (ErpUtil.stringUtil.isNull(val)) {
			return val;
		}
		if (pos) {
			val = ErpUtil.stringUtil.fomatFloat(val, pos);
		} else {
			val = parseFloat(val);
		}
		var s = val + "";
		if (s.indexOf(".") == -1)
			s += ".0";
		// 如果没有小数点，在后面补个小数点和0
		if (/\.\d$/.test(s))
			s += "0";
		// 正则判断
		while (/\d{4}(\.|,)/.test(s)) {
			// 符合条件则进行替换
			s = s.replace(/(\d)(\d{3}(\.|,))/, "$1,$2");
		}
		// 每隔3位添加一个，
		return s;
	},
	// 去除千分位
	moneyRevert : function(num) {
		if ($.trim(num + "") == "") {
			return "";
		}
		num = num.toString().replace(/,/gi, '');
		return parseFloat(num);
	},
	rateToPercent : function(rate) {
		return parseFloat(rate).mul(100);
	},
	rateToThousandth : function(rate) {
		return parseFloat(rate).mul(1000);
	},
	amountToTenThousand : function(amount) {
		return parseFloat(amount).div(10000);
	},
	amountToTenThousandFormatter : function(amount) {
		if (ErpUtil.stringUtil.isNull(parseFloat(amount))) {
			return amount;
		}
		return ErpUtil.stringUtil.moneyFormat(parseFloat(amount).div(10000));
	}
};

/** *************jquery 扩展函数********************* */
jQuery.extend({
	/**
	 * @see 将javascript数据类型转换为json字符串
	 * @param 待转换对象,支持object,array,string,function,number,boolean,regexp
	 * @return 返回json字符串
	 */
	toJSON : function(object) {
		var type = typeof object;
		// edit by gm 防止出现null转换异常

		/*
		 * if(object === null || typeof object === "undefined"){ return ""; }
		 */
		if (ErpUtil.stringUtil.isNull(object)) {
			return;
		}
		if ('object' == type) {
			if (Array == object.constructor)
				type = 'array';
			else if (RegExp == object.constructor)
				type = 'regexp';
			else
				type = 'object';
		}
		switch (type) {
		case 'undefined':
		case 'unknown':
			return;
			break;
		case 'function':
		case 'boolean':
		case 'regexp':
			return object.toString();
			break;
		case 'number':
			return isFinite(object) ? object.toString() : 'null';
			break;
		case 'string':
			return '"'
					+ object.replace(/(\\|\")/g, "\\$1").replace(
							/\n|\r|\t/g,
							function() {
								var a = arguments[0];
								return (a == '\n') ? '\\n'
										: (a == '\r') ? '\\r'
												: (a == '\t') ? '\\t' : ""
							}) + '"';
			break;
		case 'object':
			if (object === null)
				return 'null';
			var results = [];
			for ( var property in object) {
				var value = jQuery.toJSON(object[property]);
				if (value !== undefined)
					results.push(jQuery.toJSON(property) + ':' + value);
			}
			return '{' + results.join(',') + '}';
			break;
		case 'array':
			var results = [];
			for ( var i = 0; i < object.length; i++) {
				var value = jQuery.toJSON(object[i]);
				if (value !== undefined)
					results.push(value);
			}
			return '[' + results.join(',') + ']';
			break;
		}
	}
});

	
String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
	if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
		return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")),
				replaceWith);
	} else {
		return this.replace(reallyDo, replaceWith);
	}
};
String.prototype.isDate = function() {
	if (this.length != 10) {
		return false;
	}
	var a = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})/;
	return a.test(this);
};
/**
 * 日期格式化 alert(new Date().format("yyyy-MM-dd")); alert(new Date("january 12 2008
 * 11:12:30").format("yyyy-MM-dd hh:mm:ss"));
 * 
 * @param format
 * @return
 */
Date.prototype.format = function(format) {
	var o = {
		"M+" : this.getMonth() + 1, // month
		"d+" : this.getDate(), // day
		"h+" : this.getHours(), // hour
		"m+" : this.getMinutes(), // minute
		"s+" : this.getSeconds(), // second
		"q+" : Math.floor((this.getMonth() + 3) / 3), // quarter
		"S" : this.getMilliseconds()
	// millisecond
	};
	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length));
	return format;
};

// 给Number类型增加一个div方法，调用起来更加方便。
Number.prototype.div = function(arg2) {
	var arg1 = this;
	var t1 = 0, t2 = 0, r1, r2;
	try {
		t1 = arg1.toString().split(".")[1].length;
	} catch (e) {
	}
	try {
		t2 = arg2.toString().split(".")[1].length;
	} catch (e) {
	}
	with (Math) {
		r1 = Number(arg1.toString().replace(".", ""));
		r2 = Number(arg2.toString().replace(".", ""));
		var val = (r1 / r2) * pow(10, t2 - t1);
		val = ErpUtil.stringUtil.fomatFloat(val, 8);
		return parseFloat(val);
	}
};
// 给Number类型增加一个mul方法，调用起来更加方便。
Number.prototype.mul = function(arg2) {
	var arg1 = this;
	var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
	try {
		m += s1.split(".")[1].length;
	} catch (e) {
	}
	try {
		m += s2.split(".")[1].length;
	} catch (e) {
	}
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
};
// 给Number类型增加一个add方法，调用起来更加方便。
Number.prototype.add = function(arg2) {
	var arg1 = this;
	var r1, r2, m;
	try {
		r1 = arg1.toString().split(".")[1].length;
	} catch (e) {
		r1 = 0;
	}
	try {
		r2 = arg2.toString().split(".")[1].length;
	} catch (e) {
		r2 = 0;
	}
	m = Math.pow(10, Math.max(r1, r2));
	return (arg1 * m + arg2 * m) / m;
};
// 给Number类型增加一个subtr 方法，调用起来更加方便。
Number.prototype.subtr = function(arg2) {
	var arg1 = this;
	var r1, r2, m, n;
	try {
		r1 = arg1.toString().split(".")[1].length;
	} catch (e) {
		r1 = 0;
	}
	try {
		r2 = arg2.toString().split(".")[1].length;
	} catch (e) {
		r2 = 0;
	}
	m = Math.pow(10, Math.max(r1, r2));
	// 动态控制精度长度
	n = (r1 >= r2) ? r1 : r2;
	return ((arg1 * m - arg2 * m) / m).toFixed(n);
};

Number.prototype.toYuan = function(precision) {
	if (typeof precision === "undefined") {
		precision = 6;
	}
	if (isNaN(this) || !isFinite(this)) {
		return 0;
	}
	var value = (this * 10000.00).toFixed(precision);
	return parseFloat(value);
};

Array.prototype.unique = function(){
	 var res = [];
	 var json = {};
	 for(var i = 0; i < this.length; i++){
	  if(!json[this[i]]){
	   res.push(this[i]);
	   json[this[i]] = 1;
	  }
	 }
	 return res;
}

function fnStatus(status, allStatus) {
	if (!status) {
		return allStatus;
	}
	var statusesArr = status.split(",");
	var statusesDicReturn = new Array();
	$.each(statusesArr, function(i, selected) {
		$.each(allStatus, function(j, selected) {
			if (statusesArr[i] == allStatus[j]["value"]) {
				statusesDicReturn.push({
					"value" : allStatus[j]["value"],
					"text" : allStatus[j]["text"]
				});
			}
		});
	});
	return statusesDicReturn;
};
(function($, e, b) {
	var c = "hashchange", h = document, f, g = $.event.special, i = h.documentMode, d = "on"
			+ c in e
			&& (i === b || i > 7);

	function a(j) {
		j = j || location.href;
		return "#" + j.replace(/^[^#]*#?(.*)$/, "$1")
	}

	$.fn[c] = function(j) {
		return j ? this.bind(c, j) : this.trigger(c)
	};
	$.fn[c].delay = 50;
	g[c] = $.extend(g[c], {
		setup : function() {
			if (d) {
				return false
			}
			$(f.start)
		},
		teardown : function() {
			if (d) {
				return false
			}
			$(f.stop)
		}
	});
	f = (function() {
		var j = {}, p, m = a(), k = function(q) {
			return q
		}, l = k, o = k;
		j.start = function() {
			p || n()
		};
		j.stop = function() {
			p && clearTimeout(p);
			p = b
		};
		function n() {
			var r = a(), q = o(m);
			if (r !== m) {
				l(m = r, q);
				$(e).trigger(c)
			} else {
				if (q !== m) {
					location.href = location.href.replace(/#.*/, "") + q
				}
			}
			p = setTimeout(n, $.fn[c].delay)
		}
		
		/msie/.test(navigator.userAgent.toLowerCase())
				&& !d
				&& (function() {
					var q, r;
					j.start = function() {
						if (!q) {
							r = $.fn[c].src;
							r = r && r + a();
							q = $('<iframe tabindex="-1" title="empty"/>')
									.hide().one("load", function() {
										r || l(a());
										n()
									}).attr("src", r || "javascript:0")
									.insertAfter("body")[0].contentWindow;
							h.onpropertychange = function() {
								try {
									if (event.propertyName === "title") {
										q.document.title = h.title
									}
								} catch (s) {
								}
							}
						}
					};
					j.stop = k;
					o = function() {
						return a(q.location.href)
					};
					l = function(v, s) {
						var u = q.document, t = $.fn[c].domain;
						if (v !== s) {
							u.title = h.title;
							u.open();
							t
									&& u.write('<script>document.domain="' + t
											+ '"<\/script>');
							u.close();
							q.location.hash = v
						}
					}
				})();
		return j
	})()
})(jQuery, this);



//easyui校验规则扩展
$.extend($.fn.validatebox.defaults.rules, {
  CHS: {
    validator: function (value, param) {
      return /^[\u0391-\uFFE5]+$/.test(value);
    },
    message: '请输入汉字'
  },
  equals: {    
      validator: function(value,param){    
          return value == $(param[0]).val();    
      },    
      message: '两次输入的密码不相等'   
  },
  english : {// 验证英语
        validator : function(value) {
            return /^[A-Za-z]+$/i.test(value);
        },
        message : '请输入英文'
    },
    ip : {// 验证IP地址
        validator : function(value) {
            return /\d+\.\d+\.\d+\.\d+/.test(value);
        },
        message : 'IP地址格式不正确'
    },
  ZIP: {
    validator: function (value, param) {
      return /^[0-9]\d{5}$/.test(value);
    },
    message: '邮政编码不存在'
  },
  QQ: {
    validator: function (value, param) {
      return /^[1-9]\d{4,10}$/.test(value);
    },
    message: 'QQ号码不正确'
  },
  mobile: {
    validator: function (value, param) {
      return /^(?:13\d|15\d|18\d)-?\d{5}(\d{3}|\*{3})$/.test(value);
    },
    message: '手机号码不正确'
  },
  tel:{
    validator:function(value,param){
      return /^(\d{3}-|\d{4}-)?(\d{8}|\d{7})?(-\d{1,6})?$/.test(value);
    },
    message:'电话号码不正确'
  },
  mobileAndTel: {
    validator: function (value, param) {
      return /(^([0\+]\d{2,3})\d{3,4}\-\d{3,8}$)|(^([0\+]\d{2,3})\d{3,4}\d{3,8}$)|(^([0\+]\d{2,3}){0,1}13\d{9}$)|(^\d{3,4}\d{3,8}$)|(^\d{3,4}\-\d{3,8}$)/.test(value);
    },
    message: '请正确输入电话号码'
  },
  number: {
    validator: function (value, param) {
      return /^[0-9]+.?[0-9]*$/.test(value);
    },
    message: '请输入数字'
  },
  money:{
    validator: function (value, param) {
     	return (/^(((-)?[1-9]\d*)|\d)(\.\d{1,2})?$/).test(value);
     },
     message:'请输入正确的金额'

  },
  mone:{
    validator: function (value, param) {
     	return (/^(([1-9]\d*)|\d)(\.\d{1,2})?$/).test(value);
     },
     message:'请输入整数或小数'

  },
  integer:{
    validator:function(value,param){
      return /^[+]?[1-9]\d*$/.test(value);
    },
    message: '请输入最小为1的整数'
  },
  integ:{
    validator:function(value,param){
      return /^[+]?[0-9]\d*$/.test(value);
    },
    message: '请输入整数'
  },
  range:{
    validator:function(value,param){
      if(/^[1-9]\d*$/.test(value)){
        return value >= param[0] && value <= param[1]
      }else{
        return false;
      }
    },
    message:'输入的数字在{0}到{1}之间'
  },
  minLength:{
    validator:function(value,param){
      return value.length >=param[0]
    },
    message:'至少输入{0}个字'
  },
  maxLength:{
    validator:function(value,param){
      return value.length<=param[0]
    },
    message:'最多{0}个字'
  },
  //select即选择框的验证
  selectValid:{
    validator:function(value,param){
      if(value == param[0]){
        return false;
      }else{
        return true ;
      }
    },
    message:'请选择'
  },
  idCode:{
    validator:function(value,param){
      return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
    },
    message: '请输入正确的身份证号'
  },
  loginName: {
    validator: function (value, param) {
      return /^[\u0391-\uFFE5\w]+$/.test(value);
    },
    message: '登录名称只允许汉字、英文字母、数字及下划线。'
  },
  equalTo: {
    validator: function (value, param) {
      return value == $(param[0]).val();
    },
    message: '两次输入的字符不一至'
  },
  englishOrNum : {// 只能输入英文和数字
        validator : function(value) {
            return /^[a-zA-Z0-9_ ]{1,}$/.test(value);
        },
        message : '请输入英文、数字、下划线或者空格'
    },
   xiaoshu:{ 
      validator : function(value){ 
      return /^(([1-9]+)|([0-9]+\.[0-9]{1,2}))$/.test(value);
      }, 
      message : '最多保留两位小数！'    
  	},
  ddPrice:{
  validator:function(value,param){
    if(/^[1-9]\d*$/.test(value)){
      return value >= param[0] && value <= param[1];
    }else{
      return false;
    }
  },
  message:'请输入1到100之间正整数'
},
jretailUpperLimit:{
  validator:function(value,param){
    if(/^[0-9]+([.]{1}[0-9]{1,2})?$/.test(value)){
      return parseFloat(value) > parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]);
    }else{
      return false;
    }
  },
  message:'请输入0到100之间的最多俩位小数的数字'
},
rateCheck:{
  validator:function(value,param){
    if(/^[0-9]+([.]{1}[0-9]{1,2})?$/.test(value)){
      return parseFloat(value) > parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1]);
    }else{
      return false;
    }
  },
  message:'请输入0到1000之间的最多俩位小数的数字'
}
});

// 扩展combobox方法
$.extend($.fn.combobox.methods, {
    selectedIndex: function (jq, index) {
        if (!index)
            index = 0;
        var data = $(jq).combobox('options').data;
        var vf = $(jq).combobox('options').valueField;
        $(jq).combobox('setValue', eval('data[index].' + vf));
    },
	defaultSelecte:function (jq, index) {
        if (!index)
            index = 0;
        var defaultData = {};
        var vf = $(jq).combobox('options').valueField;
        var tf = $(jq).combobox('options').textField;
        defaultData[vf] = null;
        defaultData[tf] = '请选择';
        var data = $(jq).combobox('options').data;
        data.splice(0,0,defaultData)
        //加上默认值后，重载数据
        $(jq).combobox('loadData',data);
        var vf = $(jq).combobox('options').valueField;
        var isMultiple =$(jq).combobox('options').multiple;
        
        if(isMultiple){
        	//多选的情况
        	$(jq).combobox('setValue',eval('data[index].' + vf));
        	
        }else{
        	//单选的情况
        	$(jq).combobox('setValue', eval('data[index].' + vf));
        }
    }
});


//扩展combobox方法
$.extend($.fn.combotree.methods, {
    selectedIndex: function (jq, index) {
        if (!index)
            index = 0;
        var data = $(jq).combotree('options').data;
        var vf = $(jq).combotree('options').valueField;
        $(jq).combotree('setValue', eval('data[index].' + vf));
    },
	defaultSelecte:function (jq, index) {
        if (!index)
            index = 0;
        var defaultData = {};
        var vf = $(jq).combotree('options').valueField;
        var tf = $(jq).combotree('options').textField;
       
        defaultData.id = null;
        defaultData.text = '请选择';
       
        var data = $(jq).combotree('options').data;
        data.splice(0,0,defaultData)
        //加上默认值后，重载数据
        $(jq).combotree('loadData',data);
        var vf = $(jq).combotree('options').valueField;
        $(jq).combotree('select',null);
    }
});

var myview = $.extend({},$.fn.datagrid.defaults.view,{
	     onAfterRender:function(target){
	          $.fn.datagrid.defaults.view.onAfterRender.call(this,target);
	          var opts = $(target).datagrid('options');
	          var vc = $(target).datagrid('getPanel').children('div.datagrid-view');
	          vc.children('div.datagrid-empty').remove();
	          if (!$(target).datagrid('getRows').length){
	              var d = $('<div class="datagrid-empty"></div>').html(opts.emptyMsg || 'no records').appendTo(vc);
	              d.css({
	                 position:'absolute',
	                 left:0,
	                 top:50,
	                 width:'100%',
	                 textAlign:'center'
	             });
	         }
	     }
	 });
/**
 * tree方法扩展
 */
$.extend($.fn.tree.methods, {
	/**
	 * 激活复选框
	 * @param {Object} jq
	 * @param {Object} target
	 */
	enableCheck : function(jq, target) { 
        return jq.each(function(){
            var realTarget;
            if(typeof target == "string" || typeof target == "number"){
                realTarget = $(this).tree("find",target).target;
            }else{
                realTarget = target;
            }
            var ckSpan = $(realTarget).find(">span.tree-checkbox");
            if(ckSpan.hasClass('tree-checkbox-disabled0')){
                ckSpan.removeClass('tree-checkbox-disabled0');
            }else if(ckSpan.hasClass('tree-checkbox-disabled1')){
                ckSpan.removeClass('tree-checkbox-disabled1');
            }else if(ckSpan.hasClass('tree-checkbox-disabled2')){
                ckSpan.removeClass('tree-checkbox-disabled2');
            }
        });
	},
	/**
	 * 禁用复选框
	 * @param {Object} jq
	 * @param {Object} target
	 */
	disableCheck : function(jq, target) {
		return jq.each(function() {
            var realTarget;
            var that = this;
            var state = $.data(this,'tree');
            var opts = state.options;

			if(typeof target == "string" || typeof target == "number"){
                realTarget = $(this).tree("find",target).target;
            }else{
                realTarget = target;
            }
            var ckSpan = $(realTarget).find(">span.tree-checkbox");
            ckSpan.removeClass("tree-checkbox-disabled0").removeClass("tree-checkbox-disabled1").removeClass("tree-checkbox-disabled2");
            if(ckSpan.hasClass('tree-checkbox0')){
                ckSpan.addClass('tree-checkbox-disabled0');
            }else if(ckSpan.hasClass('tree-checkbox1')){
                ckSpan.addClass('tree-checkbox-disabled1');
            }else{
                ckSpan.addClass('tree-checkbox-disabled2')
            }
            if(!state.resetClick){
                $(this).unbind('click').bind('click', function(e) {
                    var tt = $(e.target);
                    var node = tt.closest('div.tree-node');
                    if (!node.length){return;}
                    if (tt.hasClass('tree-hit')){
                        $(this).tree("toggle",node[0]);
                        return false;
                    } else if (tt.hasClass('tree-checkbox')){
                        if(tt.hasClass('tree-checkbox-disabled0') || tt.hasClass('tree-checkbox-disabled1') || tt.hasClass('tree-checkbox-disabled2')){
                            $(this).tree("select",node[0]);
                        }else{
                            if(tt.hasClass('tree-checkbox1')){
                                $(this).tree('uncheck',node[0]);
                            }else{
                                $(this).tree('check',node[0]);
                            }
                            return false;
                        }
                    } else {
                        $(this).tree("select",node[0]);
                        opts.onClick.call(this, $(this).tree("getNode",node[0]));
                    }
                    e.stopPropagation();
                });
            }
            
		});
	}
});


/**
 * tree方法扩展
 */
$.extend($.fn.tree.methods, {
	/**
     * 禁用选中的复选框
     * @param {Object} jq
     * @param {Object} target
     */
     // 禁用的时候保存原来的内容
  
    disableSelectedCheck : function(jq, isEnable) {
    	
        if(isEnable){
                var nodes =  $(jq).tree('getChecked');
            var l = '';
            for(var i=0; i<nodes.length; i++){
                if (l != '') l += ',';
                l += nodes[i].id;
                $(jq).tree('disableCheck',nodes[i].id)
            };
            window.disableSelectedCheckNode = l;
        }
        
    },

    /**
     * 禁用选中的复选框
     * @param {Object} jq
     * @param {Object} target
     */

    getChangeChecked : function(jq) {
      
            var nodes =  $(jq).tree('getChecked'); 
           
            
            var l = '';
            for(var i=0; i<nodes.length; i++){
                if (l != '') l += ',';
                l += nodes[i].id;
                //$(jq).tree('disableCheck',nodes[i].id)
            };
            
            //选中的内容和禁用的内容做对比
           

            function getUniqueSet( setA, setB ){
                var temp = {};
                for( var i = 0, len = setA.length; i < len ; i++ ){
                    temp[ setA[i] ] = 0;
                }
                for( var j = 0, len = setB.length; j < len ; j++ ){
                    if( typeof temp[ setB[j] ] === 'undefined' ){
                        temp[ setB[j] ] = 0;
                    }else{
                        temp[ setB[j] ]++;
                    }
                }
                //output
                var ret = [];
                for( var item in temp ){
                    !temp[item] && ret.push( item );
                }
                return ret;
            };
            var a = window.disableSelectedCheckNode.split(',');
            var b = l.split(',');
            
            var changeNodeArr = getUniqueSet( a, b );
           
            var changeNode =[];
            
            for(var i=0;i<=changeNodeArr.length;i++){
                 var thisNode = $(jq).tree('find', changeNodeArr[i]); 
                 changeNode.push(thisNode);
            };
            
            return changeNode;
         
    }
});

/**
 * radio - jQuery EasyUI radio 扩展
 *	@author 
 */

(function ($) {
	var STYLE = {
		radio : {
			cursor : "pointer",
			background : "transparent url('data:image/gif;base64,R0lGODlhDwAmANUAAP////z8/Pj4+Ovr6/v7++7u7uPj493d3ff39/Ly8vT09ICAgPX19a+vr+Li4urq6vn5+fr6+v39/dXV1efn5+bm5uTk5ODg4N7e3v7+/vHx8fDw8O3t7e/v74eHh+Hh4c3NzdfX1+np6eXl5cDAwNra2t/f38/Pz/Pz8/b29sbGxsHBwc7OzsLCwujo6NHR0by8vL29vcXFxb+/v7m5udPT09jY2MPDw7u7u7i4uNLS0uzs7AAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAPACYAAAb/QIBwSCwaj0VGSIbLzUAXQfFDap1KjktJVysMHTHQ4WKgPAqaymQDYJBYh4/FNSgkGIjBgRC6YRwjIjsddwIRAQ4cKi8GFSIcGygphgEBBRYwB2ZoCggQBJUBCBg0FHV3nqChBAcrFYQMlKGVAgYnJpKyswEJDwYTqbuhAwoQEw+qwgoDEgAbNhzCAQoiUkIaGAYdCAQCCQMD1kMEBSMmBxbEzUjs7e7v8EJKTE5Q4kJUVlhaXF5CYGLIbEqzps2bOHNO4dHDxw+gAgIyREBAKdGiRgUMNPDQwICqS5nMQGiwoGSDDJVGlaqTwUPJBR4AVGLlihABkiZRBqh1S1IELY0cDUio1OtXKgkZAGQYWomYMWTSpjFzBk0aNXHYtHHzBu4eAHLm0KmLR5ZIEAA7') no-repeat center top",
			verticalAlign : "middle",
			height : "19px",
			width : "18px",
			display : "block"
		},
		span : {
			"float" : "left",
			display : "block",
			margin : "0px 4px",
			marginTop : "5px"
		},
		label : {
			marginTop : "4px",
			marginRight : "8px",
			display : "block",
			"float" : "left",
			fontSize : "16px",
			cursor : "pointer"
		}
	};
	
	function rander(target) {
		var jqObj = $(target);
		jqObj.css('display', 'inline-block');
		var radios = jqObj.children('input[type=radio]');
		var checked;
		radios.each(function () {
			var jqRadio = $(this);
			var jqWrap = $('<span/>').css(STYLE.span);
			var jqLabel = $('<label/>').css(STYLE.label);
			var jqRadioA = $('<a/>').data('lable', jqLabel).addClass("RadioA").css(STYLE.radio).text(' ');
			var labelText = jqRadio.data('lable', jqLabel).attr('label');
			jqRadio.hide();
			jqRadio.after(jqLabel.text(labelText));
			jqRadio.wrap(jqWrap);
			jqRadio.before(jqRadioA);
			if (jqRadio.prop('checked')) {
				checked = jqRadioA;
			}
			
			jqLabel.click(function () {
				(function (rdo) {
					rdo.prop('checked', true);
					radios.each(function () {
						var rd = $(this);
						var y = 'top';
						if (rd.prop('checked')) {
							y = 'bottom';
						}
						rd.prev().css('background-position', 'center ' + y);
					});
				})(jqRadio);
			});
			jqRadioA.click(function () {
				$(this).data('lable').click();
			});
		});
		checked.css('background-position', 'center bottom');
	}
	$.fn.radio = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.radio.methods[options](this, param);
		}
		options = options || {};
		return this.each(function () {
			if (!$.data(this, 'radio')) {
				$.data(this, 'radio', {
					options : $.extend({}, $.fn.radio.defaults, options)
				});
				rander(this);
			} else {
				var opt = $.data(this, 'radio').options;
				$.data(this, 'radio', {
					options : $.extend({}, opt, options)
				});
			}
		});
	};
	// 书写方法内功
	$.fn.radio.methods = {
		getValue : function (jq) {
			var checked = jq.find('input:checked');
			var val = {};
			if (checked.length)
				val[checked[0].name] = checked[0].value;
			return val;
		},
		check : function (jq, val) {
			if (val && typeof val != 'object') {
				var ipt = jq.find('input[value=' + val + ']');
				ipt.prop('checked', false).data('lable').click();
			}
		}
	};
	// 默认样式内容
	$.fn.radio.defaults = {
		style : STYLE
	};
	if ($.parser && $.parser.plugins) {
		$.parser.plugins.push('radio');
	}
})(jQuery);


/**
 * checkbox - jQuery EasyUI checkbox 扩展
 *	@author ____′↘夏悸
 */

(function ($) {
	var STYLE = {
		checkbox : {
			cursor : "pointer",
			background : "transparent url('data:image/gif;base64,R0lGODlhDwAmAKIAAPr6+v///+vr68rKyvT09Pj4+ICAgAAAACH5BAAAAAAALAAAAAAPACYAAANuGLrc/mvISWcYJOutBS5gKIIeUQBoqgLlua7tC3+yGtfojes1L/sv4MyEywUEyKQyCWk6n1BoZSq5cK6Z1mgrtNFkhtx3ZQizxqkyIHAmqtTsdkENgKdiZfv9w9bviXFxXm4KP2g/R0uKAlGNDAkAOw==') no-repeat center top",
			verticalAlign : "middle",
			height : "19px",
			width : "18px",
			display : "block"
		},
		span : {
			"float" : "left",
			display : "block",
			margin : "0px 4px",
			marginTop : "5px"
		},
		label : {
			marginTop : "4px",
			marginRight : "8px",
			display : "block",
			"float" : "left",
			fontSize : "16px",
			cursor : "pointer"
		}
	};
	function rander(target) {
		var jqObj = $(target);
		jqObj.css('display', 'inline-block');
		var Checkboxs = jqObj.children('input[type=checkbox]');
		Checkboxs.each(function () {
			var jqCheckbox = $(this);
			var jqWrap = $('<span/>').css(STYLE.span);
			var jqLabel = $('<label/>').css(STYLE.label);
			var jqCheckboxA = $('<a/>').data('lable', jqLabel).css(STYLE.checkbox).text(' ');
			var labelText = jqCheckbox.data('lable', jqLabel).attr('label');
			jqCheckbox.hide();
			jqCheckbox.after(jqLabel.text(labelText));
			jqCheckbox.wrap(jqWrap);
			jqCheckbox.before(jqCheckboxA);
			if (jqCheckbox.prop('checked')) {
				jqCheckboxA.css('background-position', 'center bottom');
			}
			jqLabel.click(function () {
				(function (ck, cka) {
					ck.prop('checked', !ck.prop('checked'));
					var y = 'top';
					if (ck.prop('checked')) {
						y = 'bottom';
					}
					cka.css('background-position', 'center ' + y);
				})(jqCheckbox, jqCheckboxA);
			});
			jqCheckboxA.click(function () {
				$(this).data('lable').click();
			});
		});
	}
	
	$.fn.checkbox = function (options, param) {
		if (typeof options == 'string') {
			return $.fn.checkbox.methods[options](this, param);
		}
		options = options || {};
		return this.each(function () {
			if (!$.data(this, 'checkbox')) {
				$.data(this, 'checkbox', {
					options : $.extend({}, $.fn.checkbox.defaults, options)
				});
				rander(this);
			} else {
				var opt = $.data(this, 'checkbox').options;
				$.data(this, 'checkbox', {
					options : $.extend({}, opt, options)
				});
			}
		});
	};
	
	function check(jq, val, check) {
		var ipt = jq.find('input[value=' + val + ']');
		if (ipt.length) {
			ipt.prop('checked', check).each(function () {
				$(this).data('lable').click();
			});
		}
	}
	
	$.fn.checkbox.methods = {
		getValue : function (jq) {
			var checked = jq.find('input:checked');
			var val = {};
			checked.each(function () {
				var kv = val[this.name];
				if (!kv) {
					val[this.name] = this.value;
					return;
				}
				
				if (!kv.sort) {
					val[this.name] = [kv];
				}
				val[this.name].push(this.value);
			});
			return val;
		},
		check : function (jq, vals) {
			if (vals && typeof vals != 'object') {
				check(jq, vals);
			} else if (vals.sort) {
				$.each(vals, function () {
					check(jq, this);
				});
			}
		},
		unCheck : function (jq, vals) {
			if (vals && typeof vals != 'object') {
				check(jq, vals, true);
			} else if (vals.sort) {
				$.each(vals, function () {
					check(jq, this, true);
				});
			}
		},
		checkAll : function (jq) {
			jq.find('input').prop('checked', false).each(function () {
				$(this).data('lable').click();
			});
		},
		unCheckAll : function (jq) {
			jq.find('input').prop('checked', true).each(function () {
				$(this).data('lable').click();
			});
		}
	};
	$.fn.checkbox.defaults = {
		style:STYLE
	};
	
	if ($.parser && $.parser.plugins) {
		$.parser.plugins.push('checkbox');
	}
})(jQuery);


/**
 * 搜索项显示隐藏
 *模块页面调用searchBox(n)
 *	@author linhai
 */
var searchBox = function(n){
	var box = $(n);
	var btn = $(".search-more");
	var boxH = box.height();
	var tabH = box.find(".search_table").height();
	setTimeout(function(){box.parents(".layout").find(".layout-panel").addClass("unposition")},100);/*去掉搜索项所在页面面板的定位*/
	if(tabH > boxH){
		btn.show();
	}
	btn.click(function(){
		if($(this).hasClass("on")){	
			$(this).removeClass("on").text("点击展开更多")					
			box.height("70");
			box.parents(".layout").css({'overflow-y':'hidden'})
		}else{
			$(this).addClass("on").text("点击隐藏更多");
			box.css("height","auto");
			box.css({height:'auto','max-height':'none'});
			box.parents(".layout").css({'overflow-y':'auto'})
		}
	})
}

$(function(){
	// 禁止delete回退
	$(document).keydown(function(e){
		var name = e.target.nodeName;
		if((name != 'INPUT') && (name != 'TEXTAREA')){
			if(e.keyCode == 8){
				return false;
			}
		}
	});
});


//回车事件
$(window).on('keypress',function(e){
	var e = e || window.event; 
	if(e.keyCode === 13  && !e.altKey && !e.ctrlKey && !e.shiftKey){
			console.log("huiche");
			$('.search_btn').trigger('click');
	}
});




