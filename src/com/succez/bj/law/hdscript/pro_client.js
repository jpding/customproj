(function($) {
	var widlg = sz.sys.namespace("sz.custom.wi");
	
	/**
	 * exJson 传递showForm相关参数，查看详情的时候是使用showForm来实现的，不需要保存按钮
	 * 
	 * {hidebutton:"xxx"}
	 * {showbutton:"xxx"}
	 * 
	 * formdata和exJson参数重复，需要进行合并
	 */
	widlg.showWIFormDialog = function(residOrPath, formdata, width, height, exJson, callbackfunc ,submitFormCallback) {
		var self = this;
		
		/**
		 * 回调函数是全局的，每次都应该赋值，避免调用上次传过的回调函数
		 */
		sz.custom.wi.on_callback=callbackfunc;
		sz.custom.wi.on_submitcallback=submitFormCallback;
		
		var hiddenButton = _getWIDlgParamValue(formdata, exJson, "hiddenbutton");
		var dlgTitle = _getWIDlgParamValue(formdata, exJson, "title");
		
		var datas = {
			resid : residOrPath,
			form : "STARTFORM",
			openmode : "dialog",
            width : width,
			height : height,
			ownerid : residOrPath + "$STARTFORM",
			datas : JSON.stringify(formdata)
		};
		
		$.extend(datas, exJson);
		
		var url="/wiapi/form/showStartForm";
		if(exJson && exJson["url"]){
			url = exJson["url"];
		}
		
		/**
		 * url1:"/wiapi/form/showStartForm"
		 * url2:"/wiapi/form/showForm"
		 */
		if (!this.formDlg) {
			this.formDlg = sz.commons.Dialog.create();
			this.formDlg.one(sz.commons.Dialog.EVENTS.SHOW, function() {
					var htmlContent = self.formDlg.getHtmlContent();
					var form = $$(htmlContent.find(".sz-wi-component"));
                    var baseform = form.getWIBaseForm();
                    _formInited(baseform, self.formDlg, hiddenButton);
				});
			
			/**
			 * 2014-12-22
			 * 在IE8下，点击取消以后，系统仍然视为已经修改，故在取消的时候，要设置为页面无修改，不然会
			 * 出现windows的提示框
			 */
			this.formDlg.one(sz.commons.Dialog.EVENTS.CLOSE, function() {	
				sz.commons.CheckSaved.getInstance().setModified();
			})
		}
		
		
		this.formDlg.setParams({"title":dlgTitle?dlgTitle:"对话框"});
		
		this.formDlg.$buttons.hide();
		this.formDlg.show({
					url : sz.sys.ctx(url),
					data : datas,
                    width  : width,
			        height : height
				});
	}
	
	function _getWIDlgParamValue(formdata, exJson, key){
		var vv = null;
		if(formdata){
			vv = formdata[key];
			formdata[key] = null;
			delete formdata[key];
		}
		
		if(exJson){
			vv = exJson[key];
			exJson[key] = null;
			delete exJson[key];
		}
		return vv;
	}

    function _formInited(baseform, dlg, hiddenButton) {
    	setTimeout(function(){
	    	if (baseform.isFormInited()) {
				_hiddenButtons(dlg, hiddenButton);
			} else {
				/*
				baseform.on("init", function(){
					
				})
				 * 
				 */
				_formInited(baseform, dlg, hiddenButton);
			}	
    	},10);
	}
	
	function _hiddenButtons(dlg, hiddenButton){
		$.each(hiddenButton || [], function(){
			var btn = dlg.getButton(this);
			if (btn){
				btn.visible(false);
			}
		})
		dlg.$buttons.show();
	}
	
	function orgPatch(formData){
		if(!formData){
			return ;
		}
		formData["ORG"] = formData["org"];
	}
	
	/**
	 * 新增一条数据
	 */
	widlg.addFormData = function(wiPath,formData, width, height, callback){
		formData = formData || {};
		orgPatch(formData);
		if(formData["uk"]){
			if(!formData[formData["uk"]]){
				sz.commons.Alert.show({
				    type	: sz.commons.Alert.TYPE.WARNING,
				    msg		: "请选择一行数据"
			    });
				return ;
			}
			delete formData["uk"];
		}
		widlg.showWIFormDialog(wiPath, formData, width, height, null, callback);
	}
	
	
	/**
	 * 查看数据，要隐藏保存、和提交
	 */
	widlg.showFormData = function(wiPath,formData, width, height){
		formData["url"]="/wiapi/form/showForm";
		formData["hiddenbutton"]=["wisubmit", "wisave"];
		orgPatch(formData);
		if(!formData["businesskey"]){
			sz.commons.Alert.show({
			    type	: sz.commons.Alert.TYPE.WARNING,
			    msg		: "请选择一行数据"
		    });
			return ;
		}
		widlg.showWIFormDialog(wiPath, null, width, height, formData);
	}
	
	/**
	 * 修改数据
	 * formdata : {formdatas:{comp:value,comp2:value}}
	 */
	widlg.modifyFormData = function(wiPath,formData, width, height, callback){
		orgPatch(formData);
		formData["url"]="/wiapi/form/showForm";
		if(!formData["seltable"]){
			if(!formData["businesskey"]){
				sz.commons.Alert.show({
				    type	: sz.commons.Alert.TYPE.WARNING,
				    msg		: "请选择一行数据"
			    });
				return ;
			}
		}
		
		widlg.datas = formData.formdatas;
		
		widlg.showWIFormDialog(wiPath, null, width, height, formData, callback);
	}

	
	widlg.REPORTDEFAULTPARAMS = {$sys_calcnow:true, $sys_disableCache:true, $sys_showCaptionPanel:false};
	
	/**
	 * 把报表以对话框的方式显示出来
	 * @param url  报表路径，不带上下文根
	 * @param dlgParams   对话框相关的参数
	 * @param callbackfunc  点击对话框上的按钮时的回调函数  {ok:function(){}}
	 * @param reportParams  报表参数，一般都不用传
	 */
	widlg.showReportDlg = function(url, dlgParams, callbackfunc, reportParams){
		url = sz.sys.ctx(url);
		if(!this.reportdlg){
			this.reportdlg = sz.commons.Dialog.create(dlgParams);
		} 
		this.reportdlg.setParams(dlgParams);
		var self = this;
		if(callbackfunc){
			$.each(callbackfunc, function(k, v){
				self.reportdlg.on(k, function(){
					var rpt = sz.bi.prst.Report.getInstance({pdom:this.basedom()});
					v(rpt);
				});
			});
		}
		
		this.reportdlg.on("close", function(){
			if(callbackfunc){
				$.each(callbackfunc, function(k, v){
					self.reportdlg.off(k);
				});
			}	
		});
		
		var datas = {};
		$.extend(datas, widlg.REPORTDEFAULTPARAMS);
		
		this.reportdlg.show({
			"url":url,
			data : datas
		});
	}
	
	
	
	/**
	 * 通过工作流的方式弹出表单，使用showFrom的方式，外部只需要传入明细数据，根据明细数据获取对应的org
	 */
	widlg.showWiForm = function(residOrPath, jsonParams, width, height, callbackfunc){
		var uid = jsonParams["uid"];
		var dbTable = jsonParams["table"];
		var url = sz.sys.ctx("/meta/LAWCONT/others/db/formorg.action");
		$.post(url, {"uid":uid, "table":dbTable}, function(jsonData){
			var org = jsonData;
			var exData = {businesskey:uid,"org":org, hiddenbutton:['wisubmit']};
			widlg.modifyFormData(residOrPath, exData, width, height, callbackfunc);
		});
	}
	
	/**
	 * 重新初始化，当编辑、删除相关表单后，当前表单需要refresh，而refresh时的内容
	 * 时table的样式会丢失，故需要重建
	 */
	widlg.initSelectedTable = function(rpt, tableId){
		var selectTable = rpt.getCurrentBodyDom().find("#"+tableId);
		var selectTableObj = sz.commons.SelectableTable.createSelectable(selectTable);
		
		rpt.$seltable = selectTableObj;
		
		return selectTableObj;
	}
	
	widlg.refreshAndInitSelectedTable = function(rpt, tableId){
		
	}
	
	/**
	 * 钻取后返回上一次钻取
	 */
	widlg.drillback = function() {
		var drill = $(".sz-bi-prst-drillpath").children("li").eq(-2).find("a")
				.attr("href");
		var leftBr = drill.indexOf("(");
		var rightBr = drill.indexOf(")");
		var obj = eval(drill.substring(leftBr, rightBr + 1));
		szshowresult(obj);
	}
	
	widlg.drill = function(drillTo, rpt, hintIndex){
		var uid = rpt.$seltable.getSelectedRowCellHint(hintIndex);
		if(!uid){
			sz.commons.Alert.show({
								 type : sz.commons.Alert.TYPE.WARNING,
				    			 msg  : "请选择一行数据"
							});
			return ;
		}
		rpt.drill({
			"$sys_customparameters":"@uid="+uid,
			"$sys_drillto" : drillTo,
			"$sys_passparameters" : "true",
			"$sys_target" : "self"
		});
	}
	
	/**
	 * var pdom = $("#xxx");
	 * var url  = sz.sys.ctx("/wiapi/form/showForm");
	 * var data = {resid:6717469,form:'MAINTAIN',businessKey:'8f85572bc1264e82905be14034890ac0'}
	 * 
	 * 将外部链接的内容显示在指定的控件中
	 * args是json对象，包含以下属性：
	 * pdom  
	 * url
	 * data  {obj:'',dd:''}
	 */
	widlg.showHtml = function(pdom, url, data, success, fail) {
		$.ajax({
			"url" : url,
			cache : false,
			dataType : "html",
			"data" : data,
			success : function(form) {
				if (!form) {
					sz.commons.Alert.show({
								msg : "表单内容不存在，请确认绑定了正常的表单？"
							});
					return;
				}
				sz.utils.setInnerHTML(form, pdom, function() {
							$$(pdom.find(".sz-wi-component"));
							success && success();
						});
			},
			error : function() {
				if (fail) {
					fail();
				}
			}
		});
	};
	
	/**
	 * 嵌入外部的网页到系统中
	 */
	widlg.showIFrame = function(args){
		//TODO
	}

	/**
	 * 在报表里面不能直接调用sz.wi.api下面的js代码 copy wiapi.js相关函数
	 */
	/**
	 * 获取对话框，该对话框应该是一个单例的，避免重复创建多个对话框
	 */
	widlg._getDialog = function() {
		if (!this.taskDlg) {
			this.taskDlg = sz.commons.Dialog.create();
		}
		this.taskDlg.setParams({"title":sz.sys.message("正在打开对话框...")});
		return this.taskDlg;
	}
	
	
	/**
	 * 
	 */
	widlg.deleteFormData = function(wiPath, rpt){
		/**
		 * TODO 目前都是使用工作流表单进行删除，待以后根据需要在实现
		//var url = sz.sys.ctx("/cidatamgr/delete");
		var performId = planDetailTable.getSelectedRowCellHint(0);
		sz.custom.wi.deleteWIFormData("LAWCONT:/workflows/法律业务系统/CONT_PROJ", "STARTFORM", performId, function(){
			sz.custom.wi.refreshcomp($rpt,"table1","lt_0.A3");
		});
		*/
		
	}
	
	/**
	 * 删除流程表单数据，调用该方法时，和该流程表单相关联的数据都会一起删除
	 * {"resid":6488093,"form":"MAINTAIN","keys":["3130f575-553b-4366-9a19-03b89220d0ae"]}
	 * @resid 工作流的资源ID，一般调用时传递路径
	 * @formAlias 工作流对应表单的别名
	 * @keys keys是待删除该表单主键的列表，是一个数组
	 */
	widlg.deleteWIFormData = function(resid, formAlias, key, success){
		var keys = [];
		keys.push(key);
		
		var args = {
			"resid":resid,
			"form":formAlias,
			"businesskeys":keys,
			"success":success
		};
		
		var dlg = this._getDialog();
		dlg.func = args.success || function() {
			window.location.reload();
		};
		dlg.showHtml({
			url : sz.sys.ctx("/wiapi/deleteFormDatas"),
			data : {
                               resid:args.resid,
                               params:JSON.stringify(args)
                        }
		});
	}
		
	
	/**
	 * 在工作流表单脚本中调用
	 */
	widlg.saveFormCallback = function(){
		if(sz.custom.wi.on_callback){
			sz.custom.wi.on_callback();
		}
		var topDlg = sz.commons.DialogMgr.getTopDlg();
		if (topDlg) topDlg.close();		
	}
	
	/**
	 * 在工作流表单脚本中调用
	 */
	widlg.submitFormCallback = function(){
		if(sz.custom.wi.on_submitcallback){
			sz.custom.wi.on_submitcallback();
		}
		var topDlg = sz.commons.DialogMgr.getTopDlg();
		if (topDlg){
			topDlg.close();
		}
	}
	
	widlg.refreshcomp = function(rpt, compid, target){
		//$sys_target:"lt_0.A3"
		//$sys_targetComponent
		var refreshParams = {"$sys_customparameters":"$sys_disableCache=true","$sys_targetComponent":compid};
		if(target){
			$.extend(refreshParams, {"$sys_target":target});
		}
		rpt.refreshcomponents(refreshParams);
	}
	
	
	/**
	 * 扩展jQuery函数，便于实现报表进行选择功能
	 */
	$.extend({
		wiSelTable : function(rpt, tableId){
			rpt.ondisplay = function(obj){
				sz.custom.wi.initSelectedTable(rpt, tableId);
			}
			
			rpt.on("calcsuccess", function(obj){
				sz.custom.wi.initSelectedTable(rpt, tableId);
			});
		}
	});
	
	/**
	 * 行选择Table
	 */

	if (sz.commons.SelectableTable)
		return;
	var SelectableTable = sz.sys.createClass("sz.commons.SelectableTable",
			"sz.commons.ComponentBase");

	SelectableTable.createSelectable = function(pdom) {
		return sz.commons.SelectableTable.create(pdom);
	}

	SelectableTable.DEFAULT_ARGS = {
		/**
		 * @arg{String} 控件的唯一标识
		 */
		"id" : null
	};

	SelectableTable.EVENTS = {
		/**
		 * 选择了列表中一行的事件
		 */
		SELECT : "select"
	};

	/**
	 * 此方法是SelectableTable.build需要调用的，用于从已有的DOM元素来构造与初始化列表控件，支持的DOM结构见类的注释
	 * 
	 * BI-11258 不能使用build，由于报表有个prst.Table对象绑定的在报表上，如果使用build会导致后一个对象覆盖前一个对象
	 *    故这里使用init，并且依据succezCore.js中的_createInstance代码中_cacheInstance的实现来避开把当前对象绑定到
	 *    报表
	 *    
	 *  if (inst.$dom) {
	 *		_cacheInstance(inst.$dom, inst);
	 *	}
	 * 
	 * @private
	 * @param {Element,jQuery}
	 *            p 元素对象或者jQuery选择器对象
	 */
	SelectableTable.prototype.init = function(p) {
		this.multi = false; // 默认只能选择一行

		var self = this;
		var $trs = p.find("tr:gt(1)");
		$trs.bind({
					"click" : function(event) {
						var $rs = $(event.target || event.srcElement);
						var $tr = $(this);

						if (self.multi) {
							$tr.toggleClass("list-onselect");
						} else {
							self.cancelSelected();
							$tr.addClass("list-onselect");
						}
						self.fire('select', {
									$tr : $tr
								})
					}
				});
		$trs.bind({
					"mouseenter" : function(event) {
						var $tr = $(this);
						$tr.addClass("list-onmouseover");
					}
				});
		$trs.bind({
					"mouseleave" : function(event) {
						var $tr = $(this);
						$tr.removeClass("list-onmouseover");
					}
				});
	}
	
	SelectableTable.prototype.doAfterInit = function(args){
		this.$dom = args;
	}
	
	/**
	 * 设置表格是否能多选
	 */
	SelectableTable.prototype.setMulti = function(enable) {
		this.multi = enable;
	}

	/**
	 * 取消选定行
	 */
	SelectableTable.prototype.cancelSelected = function() {
		this.$dom.find(".list-onselect").removeClass("list-onselect");
	}

	/**
	 * 当前已选中的行数（本控件暂时只支持选中一行）
	 */
	SelectableTable.prototype.selectedCount = function() {
		var rows = this.$dom.find(".list-onselect");
		return rows.length;
	}

	/**
	 * 获取选定的行的某个单元格的值
	 */
	SelectableTable.prototype.getSelectedRowCellValue = function(index) {
		if (this.multi)
			return this._getSelectedRowCellValue_m(index);
		else
			return this._getSelectedRowCellValue_s(index);
	}

	/**
	 * 获取选定的行的某个单元格的值(单选模式)
	 */
	SelectableTable.prototype._getSelectedRowCellValue_s = function(index) {
		var rows = this.$dom.find(".list-onselect");
		if (rows.length == 0)
			return null;
		var cells = rows.children("td");
		if (cells.length < index + 1)
			return null;
		else
			return cells.eq(index).text();
	}

	/**
	 * 获取选定的行的某个单元格的值(多选模式)
	 */
	SelectableTable.prototype._getSelectedRowCellValue_m = function(index) {
		var rows = this.$dom.find(".list-onselect");
		if (rows.length == 0)
			return [];

		var result = [];
		rows.each(function(i) {
					var cells = $(this).children("td");
					if (cells.length >= index + 1)
						result.push(cells.eq(index).text());
				});
		return result;
	}

	/**
	 * 获取选定的行的某个单元格的hint提示
	 */
	SelectableTable.prototype.getSelectedRowCellHint = function(index) {
		if (this.multi)
			return this._getSelectedRowCellHint_m(index);
		else
			return this._getSelectedRowCellHint_s(index);
	}

	/**
	 * 获取选定的行的某个单元格的hint提示(单选模式)
	 */
	SelectableTable.prototype._getSelectedRowCellHint_s = function(index) {
		var rows = this.$dom.find(".list-onselect");
		if (rows.length == 0)
			return null;
		var cells = rows.children("td");
		if (cells.length < index + 1)
			return null;
		else
			return cells.eq(index).attr("title");
	}

	/**
	 * 获取选定的行的某个单元格的hint提示(多选模式)
	 */
	SelectableTable.prototype._getSelectedRowCellHint_m = function(index) {
		var rows = this.$dom.find(".list-onselect");
		if (rows.length == 0)
			return [];

		var result = [];
		rows.each(function(i) {
					var cells = $(this).children("td");
					if (cells.length >= index + 1)
						result.push(cells.eq(index).attr("title"));
				});
		return result;
	}
})(jQuery);