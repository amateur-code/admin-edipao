/**
	TABLEFILTER
**/

layui.define(['table', 'jquery', 'form', 'laydate'], function (exports) {

    var MOD_NAME = 'tableFilter',
		$ = layui.jquery,
		table = layui.table,
		form = layui.form,
		laydate = layui.laydate;

	var tableFilter = {
		"v" : '1.0.0'
    };

	//缓存
	tableFilter.cache = {}

	//渲染
	tableFilter.render = function(opt){
		
		//配置默认值
		var elem = $(opt.elem || '#table'),
			elemId = elem.attr("id") || "table_" + new Date().getTime(),
			filters = opt.filters || [],
			parent = opt.parent || 'body',
			mode = opt.mode || "local";

		//写入默认缓存
		tableFilter.cache[elemId]={};

		var initData;
		try {
			initData = JSON.parse(sessionStorage.getItem("tableFilterData")) || {};
		} catch (error) {
			initData = {};
		}
		tableFilter.cache[elemId] = initData[elemId] || {};
		opt.done(JSON.parse(JSON.stringify(tableFilter.cache[elemId])), true);
		//主运行
		var main = function (){

			//默认过滤
			if(mode == "local"){
				var trsIndex = tableFilter.getShowTrIndex(elem, elemId, filters);
				if(trsIndex.length > 0){
					var trs = elem.next().find('.layui-table-body tr');
					trs.each(function(i, tr){
						if($.inArray($(tr).data("index"), trsIndex) != -1){
							$(tr).removeClass("layui-hide")
						}else{
							$(tr).addClass("layui-hide")
						}
					})
				}else{
					elem.next().find('.layui-table-body tr').removeClass("layui-hide")
				}
			}

			//遍历过滤项
			layui.each(filters, function(i, filter){
				var filterField = filter.field,
					filterName = filter.name || filter.field,
					filterType = filter.type || "input",
					filterData = filter.data || [],
					filterUrl = filter.url || "",
					radioItem = filter.radioItem || "";

				//插入图标
				var th = elem.next().find('.layui-table-header th[data-field="'+filterField+'"]');
				// var icon = filterType == 'input' ? 'layui-icon-search' : 'layui-icon-down';
				var icon = 'layui-icon-search';
				var filterIcon = $('<span class="layui-table-filter layui-inline"><i class="layui-icon '+icon+'"></i></span>');
				th.find('.layui-table-cell').append(filterIcon)
				//图标默认高亮
				if((initData[elemId] && initData[elemId][filterName] && initData[elemId][filterName].length > 0) || tableFilter.cache[elemId] && tableFilter.cache[elemId][filterName]){
					filterIcon.addClass("tableFilter-has")
				}else{
					filterIcon.removeClass("tableFilter-has")
				}

				//图标点击事件
				filterIcon.on("click", function(e) {
					e.stopPropagation();
					//得到过滤项的选项
					//如果开启本地 并且没设置数据 就读本地数据
					//console.log(mode == "local", filterData.length <= 0, !filterUrl, filterType != "input")
					if(filterData.length <= 0 && !filterUrl && filterType != "input"){
						filterData = tableFilter.eachTds(elem, filterField);
					}

					//弹出层
					var t = $(this).offset().top + $(parent).scrollTop() + $(this).outerHeight() + 5 +"px";
					var l = $(this).offset().left - ($('body').outerWidth(true) - $(parent).outerWidth(true)) - 164 +"px";
					var filterBox = $('<div class="layui-table-filter-view" style="top:'+t+';left:'+l+';"><div class="layui-table-filter-box"><form class="layui-form" lay-filter="table-filter-form"></form></div></div>');
					if(filterType == "input"){
						filterBox.find('form').append('<input type="search" name="'+filterName+'" lay-verify="required" lay-verType="tips" placeholder="关键词" class="layui-input">');
					}
					if(filterType == "checkbox"){
						filterBox.find('form').append('<ul></ul>');
						if(!filterUrl){
							layui.each(filterData, function(i, item){
								filterBox.find('ul').append('<li><input type="checkbox" name="'+filterName+'['+item.key+']" value="'+item.key+'" title="'+item.value+'" lay-skin="primary"></li>');
							})
						}
					}
					if(filterType == "checkbox-numberslot"){
						filterBox.find('form').append('<ul style="height:auto;"></ul>');
						if(!filterUrl){
							layui.each(filterData, function(i, item){
								filterBox.find('ul').append('<li><input type="checkbox" name="'+filterName+'['+item.key+']" value="'+item.key+'" title="'+item.value+'" lay-skin="primary"></li>');
							})
						}
						filterBox.find('form').append('<input type="search" name="'+filterName+'-min" lay-verType="tips" placeholder="输入最小值" class="layui-input">');
						filterBox.find('form').append('<input type="search" name="'+filterName+'-max" lay-verType="tips" placeholder="输入最大值" class="layui-input">');
					}
					if(filterType == "radio"){
						filterBox.find('form').append('<ul class="radio"></ul>');
						if(!filterUrl){
							filterBox.find('ul').append('<li><input type="radio" name="'+filterName+'" value="" title="All" checked></li>');
							layui.each(filterData, function(i, item){
								filterBox.find('ul').append('<li><input type="radio" name="'+filterName+'" value="'+item.key+'" title="'+item.value+'"></li>');
							})
						}
					}
					if(filterType == "timeslot"){
						filterBox.find('form').append('<input type="text" id="'+filterName+'-timeslot" name="'+filterName+'" lay-verify="required" lay-verType="tips" placeholder="请选择时间段" class="layui-input">');
					}

					if(filterType == 'numberslot'){
						filterBox.find('form').append('<input type="search" name="'+filterName+'-min" lay-verify="numberslot" lay-verType="tips" placeholder="输入最小值" class="layui-input">');
						filterBox.find('form').append('<input type="search" name="'+filterName+'-max" lay-verify="numberslot" lay-verType="tips" placeholder="输入最大值" class="layui-input">');
					}

					if(filterType == 'contract'){
						filterBox.find('form').append('<input type="search" name="'+filterName+'-name" lay-verify="contract" lay-verType="tips" placeholder="输入姓名" class="layui-input">');
						filterBox.find('form').append('<input type="search" name="'+filterName+'-phone" lay-verify="contract" lay-verType="tips" placeholder="输入手机号" class="layui-input">');
					}

					if(filterType == 'province'){
						filterBox.find('form').append(
							`<div class="layui-form-item x-city" id="${filterName}">
								<select name="${filterName}" lay-filter="province" lay-verify="provinceVerify">
								<option value="">请选择省</option>
								</select>
							</div>`
						);
					}
					if(filterType == 'provincecity'){
						filterBox.find('form').append(
							`
							<div class="layui-form-item x-city" id="${filterName}">
								<select name="${filterName + "_province"}" lay-filter="province" lay-verify="provinceVerify">
								<option value="">请选择省</option>
								</select>
								<select name="${filterName + "_city"}" lay-filter="city" lay-verify="cityVerify">
								<option value="">请选择市</option>
								</select>
							</div>
							`
						);
					}

					// 自定义-城市
					if(filterType == "city"){
						filterBox.find('form').append(`<div class="layui-form layui-col-md12  layui-form-pane">
							<div class="layui-form-item x-city" id="${filterName}Start">
							<label>始发地：</label>
							<div>
							<select name="${filterName}Start-province" lay-filter="province" lay-verify="provinceVerify">
							<option value="">请选择省</option>
							</select>
							</div>
							<div>
							<select name="${filterName}Start-city" lay-filter="city" lay-verify="cityVerify">
							<option value="">请选择市</option>
							</select>
							</div>
							</div>
							<div class="layui-form-item x-city" id="${filterName}End">
							<label>目的地：</label>
							<div>
							<select name="${filterName}End-province" lay-filter="province" lay-verify="provinceVerify">
							<option value="">请选择省</option>
							</select>
							</div>
							<div>
							<select name="${filterName}End-city" lay-filter="city" lay-verify="cityVerify">
							<option value="">请选择市</option>
							</select>
							</div>	
							</div>
							</div>`);

					}


					filterBox.find('form').append('<button class="layui-btn layui-btn-normal layui-btn-sm" lay-submit lay-filter="tableFilter">确定</button>');
					filterBox.find('form').append('<button type="button" class="layui-btn layui-btn-primary layui-btn-sm filter-del layui-btn-disabled" disabled>取消过滤</button>');

					//设置清除是否可用
					$(this).hasClass('tableFilter-has') && filterBox.find('.filter-del').removeClass("layui-btn-disabled").removeAttr("disabled","disabled");

					//加入DOM
					$(parent).append(filterBox);
					// 渲染时间选择
					if(filterType == "timeslot"){
						laydate.render({
						    elem: filterBox.find('input[name='+filterName+']')[0],
						    type: 'datetime',
								range: '至',
								trigger: "click"
						});
					}

					//赋值FORM
					form.val("table-filter-form", tableFilter.toLayuiFrom2(initData[elemId], filterName, filterType) || tableFilter.toLayuiFrom(elemId, filterName, filterType));

					if(filterType == "city"){
						var val = tableFilter.toLayuiFrom2(initData[elemId], filterName, filterType) || tableFilter.toLayuiFrom(elemId, filterName, filterType) || '';
						if(val && JSON.stringify(val) != "{}"){
							// 必须引用xctiy.js 有值时赋值
							$('#'+filterName+'Start').xcity(val[filterName+'Start-province'],val[filterName+'Start-city']);
							$('#'+filterName+'End').xcity(val[filterName+'End-province'],val[filterName+'End-city']);
						}else{
							// 必须引用xctiy.js 初始化
							$('#'+filterName+'Start').xcity();
							$('#'+filterName+'End').xcity();
						}
					}
					if(filterType == "province"){
						var val = tableFilter.toLayuiFrom2(initData[elemId], filterName, filterType) || tableFilter.toLayuiFrom(elemId, filterName, filterType) || '';
						if(val && JSON.stringify(val) != "{}" && val[filterName] && JSON.stringify(val[filterName]) != "{}"){
							// 必须引用xctiy.js 有值时赋值
							$('#'+filterName).xcity(val[filterName][filterName]);
						}else{
							// 必须引用xctiy.js 初始化
							$('#'+filterName).xcity();
						}
					}
					if(filterType == "provincecity"){
						var val = tableFilter.toLayuiFrom2(initData[elemId], filterName, filterType) || tableFilter.toLayuiFrom(elemId, filterName, filterType) || '';
						if(val && JSON.stringify(val) != "{}" && val[filterName] && JSON.stringify(val[filterName]) != "{}"){
							// 必须引用xctiy.js 有值时赋值
							$('#'+filterName).xcity(val[filterName]["province"],val[filterName]["city"]);
						}else{
							// 必须引用xctiy.js 初始化
							$('#'+filterName).xcity();
						}
					}
					//渲染layui form
					form.render(null, 'table-filter-form');

					//渲染FORM 如果是searchInput 就默认选中
					var searchInput = filterBox.find('form input[type="search"]');
					searchInput.focus().select();

					//处理异步filterData
					
					if((filterType == 'checkbox' || filterType == 'radio' || filterType == "checkbox-numberslot") && filterUrl){
						var filterBoxUl = filterBox.find('.layui-table-filter-box ul');
						filterBoxUl.append('<div class="loading"><i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i></div>');

						$.getJSON(filterUrl + "?_t=" + new Date().getTime(), function(res, status, xhr){
							filterBoxUl.empty();
							filterType == "radio" && filterBoxUl.append('<li><input type="radio" name="'+filterName+'" value="" title="All" checked></li>');
							layui.each(res.data, function(i, item){
								filterType == "checkbox" && filterBoxUl.append('<li><input type="checkbox" name="'+filterName+'['+item.key+']" value="'+item.key+'" title="'+item.value+'" lay-skin="primary"></li>');
								filterType == "radio" && filterBoxUl.append('<li><input type="radio" name="'+filterName+'" value="'+item.key+'" title="'+item.value+'"></li>');
							})
							form.render(null, 'table-filter-form');
							form.val("table-filter-form", tableFilter.toLayuiFrom2(initData[elemId], filterName, filterType) || tableFilter.toLayuiFrom(elemId, filterName, filterType));
						});
					}

					form.verify({
			            numberslot: function(value) {
			            	var min = filterBox.find('[name="'+filterName+'-min"]').val().trim(),
			            		max = filterBox.find('[name="'+filterName+'-max"]').val().trim();
			            	if(!min && !max) return '至少输入一个值';
			            	if(value && isNaN(value)){
         						return '必须输入数字';
         					}
			                if (min != '' && max != '' && (min - 0 > max - 0)) {
			                    return '最小值不能大于最大值';
			                }
			            },
			            contract: function(value) {
			            	var name = filterBox.find('[name="'+filterName+'-name"]').val().trim(),
			            		phone = filterBox.find('[name="'+filterName+'-phone"]').val().trim();
			            	if(!name && !phone) return '至少输入姓名或手机号';
			            },
			        });

					//点击确认开始过滤
					form.on('submit(tableFilter)', function(data){
						//重构复选框结果
						if(filterType == "checkbox"){
							var NEWfield = [];
							for(var key in data.field){
								NEWfield.push(data.field[key])
							}
							data.field[filterName] = NEWfield
						}

						if(filterType == 'numberslot'){
							data.field[filterName] = [data.field[filterName+'-min'],data.field[filterName+'-max']]
						}
						if(filterType == 'contract'){
							data.field[filterName] = [data.field[filterName+'-name'],data.field[filterName+'-phone']]
						}
						if(filterType == "timeslot"){
							var time = data.field[filterName].split(" 至 ");
							var startTime = time[0];
							var endTime = time[1];
							if(startTime.indexOf("00:00:00") > -1 && endTime.indexOf("00:00:00") > -1){
								endTime = endTime.replace("00:00:00", "23:59:59");
							}
							data.field[filterName] = startTime + " 至 " + endTime;
						}
						// 如果城市
						if(filterType == "city"){
							var NEWfield = {};
							for(var key in data.field){
								NEWfield[key] = data.field[key]
							}
							data.field[filterName] = NEWfield
						}

						if(filterType == "province"){
							var NEWfield = {};
							for(var key in data.field){
								NEWfield[key] = data.field[key]
							}
							data.field[filterName] = NEWfield
						}
						if(filterType == "provincecity"){
							var NEWfield = {
								province: data.field[filterName+"_province"],
								city: data.field[filterName+"_city"],
							};
							data.field[filterName] = NEWfield;
						}

						if(filterType == "checkbox-numberslot"){
							var checked = [];
							var slot = [];
							for(var key in data.field){
								if(key.indexOf(filterName + "[") > -1){
									checked.push(data.field[key]);
								}
							}
							if(data.field[filterName+'-min'] || data.field[filterName+'-max']){
								slot = [data.field[filterName+'-min'],data.field[filterName+'-max']];
							}
							if(checked.length > 0 || slot.length > 0){
								data.field[filterName] = {
									checked: checked,
									slot: slot,
								};
							}else{
								layer.msg("请先选择过滤项！", {icon:2});
								return false;
							}
						}
						//过滤项写入缓存
						console.log(data)
						tableFilter.cache[elemId][filterName] = data.field[filterName];

						//如果有过滤项 icon就高亮
						if((initData[elemId] && initData[elemId][filterName] && initData[elemId][filterName].length > 0) || tableFilter.cache[elemId][filterName].length > 0){
							filterIcon.addClass("tableFilter-has")
						}else{
							filterIcon.removeClass("tableFilter-has")
						}

						if(mode == "local"){
							//本地交叉过滤
							var trsIndex = tableFilter.getShowTrIndex(elem, elemId, filters);
							if(trsIndex.length > 0 || data.field[filterName].length > 0){
								var trs = elem.next().find('.layui-table-body tr');
								trs.each(function(i, tr){
									if($.inArray($(tr).data("index"), trsIndex) != -1){
										$(tr).removeClass("layui-hide")
									}else{
										$(tr).addClass("layui-hide")
									}
								})
							}else{
								elem.next().find('.layui-table-body tr').removeClass("layui-hide")
							}
						}else if(mode == "api"){
							//服务端交叉过滤
							//将数组转字符串
							var new_where = {};
							for (var key in tableFilter.cache[elemId]) {
								var filterKey = key,
									filterValue = tableFilter.cache[elemId][key];
								if($.isArray(filterValue)){
									new_where[filterKey] = filterValue.join(",");
								}else{
									new_where[filterKey] = filterValue;
								}
							}
							table.reload(elemId,{"where":new_where})
						}
						try {
							console.log(initData)
							initData[elemId] = tableFilter.cache[elemId];
							sessionStorage.setItem("tableFilterData", JSON.stringify(initData));
						} catch (error) {}
						//写入回调函数
						opt.done(tableFilter.cache[elemId]);

						filterBox.remove();
						return false;
					})

					//点击清除此项过滤
					filterBox.find('.layui-table-filter-box .filter-del').on('click', function(e) {
						delete tableFilter.cache[elemId][filterName];
						filterIcon.removeClass("tableFilter-has");
						if(mode == "local"){
							var trsIndex = tableFilter.getShowTrIndex(elem, elemId, filters);
							if(trsIndex.length > 0){
								var trs = elem.next().find('.layui-table-body tr');
								trs.each(function(i, tr){
									if($.inArray($(tr).data("index"), trsIndex) != -1){
										$(tr).removeClass("layui-hide")
									}else{
										$(tr).addClass("layui-hide")
									}
								})
							}else{
								elem.next().find('.layui-table-body tr').removeClass("layui-hide")
							}
						}else if(mode == "api"){
							//需要清除where里的对应的值
							var where = {};
							where[filterName] = '';
							table.reload(elemId,{"where" : where});
						}
						try {
							initData[elemId] = tableFilter.cache[elemId];
							sessionStorage.setItem("tableFilterData", JSON.stringify(initData));
						} catch (error) {}
						opt.done(tableFilter.cache[elemId]);
						filterBox.remove();
					})

					//点击其他区域关闭
					$(document).mouseup(function(e){
						if(!$('.layui-laydate').is(e.target) && $('.layui-laydate').has(e.target).length === 0){
							if(!$('.layui-table-filter-view').is(e.target) && $('.layui-table-filter-view').has(e.target).length === 0){
								filterBox.remove();
							}
						}

					});

				})
			})

		};
		main();

		//函数返回
		var returnObj = {
			'config' : opt,
			'reload' : function(opt){
				main();
			}
		}
		return returnObj
	}

	//遍历行获取本地列集合 return tdsArray[]
	tableFilter.eachTds = function(elem, filterField){
		var tdsText = [],
			tdsArray = [];
		var tds = elem.next().find('.layui-table-body td[data-field="'+filterField+'"]');
		tds.each(function(i, td){
			tdsText.push($.trim(td.innerText))
		})
		tdsText = tableFilter.tool.uniqueObjArray(tdsText);
		layui.each(tdsText, function(i, item){
			tdsArray.push({'key':item, 'value':item})
		})
		return tdsArray;
	}

	//获取匹配的TR的data-index  return trsIndex[]
	tableFilter.getShowTrIndex = function(elem, elemId, filters){
		var trsIndex = [];
		var filterValues = tableFilter.cache[elemId];

		for (var key in filterValues) {
			var filterKey = key,
				filterValue = filterValues[key];

			//如果有name比对filterField
			layui.each(filters, function(i, item){
				if(filterKey == item.name){
					filterKey = item.field
				}
			})

			var tds = elem.next().find('.layui-table-body td[data-field="'+filterKey+'"]');
			//获取这一次过滤的匹配
			var this_trsIndex = [];
			tds.each(function(i, td){
				if($.isArray(filterValue)){
					//过滤值=数组 inArray 复选框
					if($.inArray($.trim(td.innerText), filterValue) >= 0 && filterValue && filterValue.length > 0){
						this_trsIndex.push($(td).parent().data("index"))
					}
				}else{
					//过滤值=字符串 indexOf 单选框 输入框
					if($.trim(td.innerText).indexOf(filterValue) >= 0){
						this_trsIndex.push($(td).parent().data("index"))
					}
				}
			})
			//取最终结果 合并数组后去相同值
			//第一次 不合并
			if(trsIndex.length <= 0){
				trsIndex = this_trsIndex
			}else{
				if(this_trsIndex.length > 0){
					//这一次有值 和前面N次取相同值
					trsIndex = tableFilter.tool.getSameArray(trsIndex, this_trsIndex);
				}else{
					//这一次没值 前面N次有值,如果字符串过滤未有值 就显示空
					trsIndex = $.isArray(filterValue) ? trsIndex : [];
				}
			}
		}
		return tableFilter.tool.uniqueObjArray(trsIndex);
	}

	tableFilter.toLayuiFrom2 = function(form_val, filterName, filterType){
		if(!form_val) form_val = "{}";
		form_val = JSON.stringify(form_val);
		form_val = JSON.parse(form_val);
		if(filterType == "checkbox"){
			layui.each(form_val[filterName], function(i, value){
				form_val[filterName + "["+value+"]"] = true;
			})
			delete form_val[filterName];
		}
		if(filterType == "numberslot"){
			if(form_val[filterName] && form_val[filterName].length == 2){
				form_val[filterName + "-min"] = form_val[filterName][0]
				form_val[filterName + "-max"] = form_val[filterName][1]
			}
		}
		if(filterType == "contract"){
			if(form_val[filterName] && form_val[filterName].length == 2){
				form_val[filterName + "-name"] = form_val[filterName][0]
				form_val[filterName + "-phone"] = form_val[filterName][1]
			}
		}
		if(filterType == "city"){
			layui.each(form_val[filterName], function(i, value){
				form_val[i] = value;
			});
			delete form_val[filterName];
		}
		if(filterType == "checkbox-numberslot"){
			form_val[filterName] && layui.each(form_val[filterName].checked, function(i, value){
				form_val[filterName + "["+value+"]"] = true;
			});
			if(form_val[filterName] && form_val[filterName].slot && form_val[filterName].slot.length == 2){
				form_val[filterName + "-min"] = form_val[filterName].slot[0];
				form_val[filterName + "-max"] = form_val[filterName].slot[1];
			}
			delete form_val[filterName];
		}
		return form_val;
	}

	//JSON 数据转layuiFOMR 可用的 处理checkbox
	tableFilter.toLayuiFrom = function(elemId, filterName, filterType){
		var form_val = JSON.stringify(tableFilter.cache[elemId]);
			form_val = JSON.parse(form_val);
		if(filterType == "checkbox"){
			layui.each(form_val[filterName], function(i, value){
				form_val[filterName + "["+value+"]"] = true;
			})
			delete form_val[filterName];
		}
		if(filterType == "numberslot"){
			if(form_val[filterName] && form_val[filterName].length == 2){
				form_val[filterName + "-min"] = form_val[filterName][0]
				form_val[filterName + "-max"] = form_val[filterName][1]
			}
		}
		if(filterType == "contract"){
			if(form_val[filterName] && form_val[filterName].length == 2){
				form_val[filterName + "-name"] = form_val[filterName][0]
				form_val[filterName + "-phone"] = form_val[filterName][1]
			}
		}
		if(filterType == "city"){
			layui.each(form_val[filterName], function(i, value){
				form_val[i] = value;
			});
			delete form_val[filterName];
		}
		if(filterType == "checkbox-numberslot"){
			form_val[filterName] && layui.each(form_val[filterName].checked, function(i, value){
				form_val[filterName + "["+value+"]"] = true;
			});
			if(form_val[filterName] && form_val[filterName].slot && form_val[filterName].slot.length == 2){
				form_val[filterName + "-min"] = form_val[filterName].slot[0];
				form_val[filterName + "-max"] = form_val[filterName].slot[1];
			}
			delete form_val[filterName];
		}
		return form_val;
	}

	//隐藏选择器
	tableFilter.hide = function(){
		$('.layui-table-filter-view').remove();
	}

	//工具
	tableFilter.tool = {
		//数组&对象数组去重
		'uniqueObjArray' : function(arr, type){
			var newArr = [];
			var tArr = [];
			if(arr.length == 0){
				return arr;
			}else{
				if(type){
					for(var i=0;i<arr.length;i++){
						if(!tArr[arr[i][type]]){
							newArr.push(arr[i]);
							tArr[arr[i][type]] = true;
						}
					}
					return newArr;
				}else{
					for(var i=0;i<arr.length;i++){
						if(!tArr[arr[i]]){
							newArr.push(arr[i]);
							tArr[arr[i]] = true;
						}
					}
					return newArr;
				}
			}
		},
		//合并数组取相同项
		'getSameArray' : function(arry1, arry2){
			var newArr = [];
			for (var i = 0; i < arry1.length; i++) {
				for (var j = 0; j < arry2.length; j++) {
					if(arry2[j] === arry1[i]){
						newArr.push(arry2[j]);
					}
				}
			}
			return newArr;
		}
	}

	//输出接口
	exports(MOD_NAME, tableFilter);
});
