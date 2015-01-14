$.extend({
     loadJsCss : function(file) {
          var files = typeof file == "string" ? [file] : file;
          var ctx = sz.sys.ctx();
          for (var i = 0; i < files.length; i++) {
               var name = files[i];
               var att = name.split('.');
               var ext = att[att.length - 1].toLowerCase();
               var isCSS = ext == "css";
               var tag = isCSS ? "link" : "script";
               var attr = isCSS
                         ? " type='text/css' rel='stylesheet' "
                         : " language='javascript' type='text/javascript' ";
               var link = (isCSS ? "href" : "src") + "='" + sz.sys.ctx(name) + "'";
               if ($(tag + "[" + link + "]").length == 0){
                    $("<" + tag + attr + link + "></" + tag + ">").appendTo("head");
               }
          }
     },
	  
	 /**
	 * 在上报时，先检查是否已经通过审核，如果没有通过则弹出审核提示信息
	 * isSave true|false
	 */
	 checkSubmitAudit:function($flow, formName, isSave, callback){
		var fillforms = $flow.getForm();
		if(formName){
			fillforms.setValue(isSave ? "10" : "20","hide_status_",formName);
		}
		var dataMgr = fillforms.datamgr;
		fillforms.endEdit({
			success:function(){
					dataMgr.audit({success:function(){
						//判断是否有审核错误
						if(isSave){
							fillforms.submit({hint:false,nodata:"true",submiterrorlevels:["checkkeyunique"],success:function(submitArgs,instArgs){
								var funcname = "save_"+formName;debugger;
								if($.wicallbacks && $.wicallbacks[funcname]){
									$.wicallbacks[funcname]();
								}else{
									/**
									 * 保存按钮执行回调函数分以下几种情况：
									 * 1.弹出表单对话框，一般用于录入明细信息，例如：纠纷进展
									 * 2.页面显示，一般就是录入表单信息，有提交、有保存，这里要跳转到维护页面，在工作流脚本中
									 *   设置回调
									 */
									if($flow.wiformparams && $flow.wiformparams.openmode == "dialog"){
										if(sz.custom && sz.custom.wi && sz.custom.wi.on_callback){
											sz.commons.CheckSaved.getInstance().setModified();
											sz.custom.wi.saveFormCallback();
										}else{
											sz.commons.CheckSaved.getInstance().setModified();
											window.location.reload();
										}
									}else{
										sz.commons.CheckSaved.getInstance().setModified();
										window.location.reload();
									}
									
								}
							}});
						}else{
							$flow.startFlow({datas:{"dim":"value"},success:function(args, result){
								var funcname = "submit_"+formName;
								if($flow.wiformparams && $flow.wiformparams.openmode == "dialog"){
									if(sz.custom && sz.custom.wi && sz.custom.wi.on_submitcallback){
										sz.commons.CheckSaved.getInstance().setModified();
										sz.custom.wi.submitFormCallback();
									}
								}	
								if($.wicallbacks && $.wicallbacks["submit_"+formName]){
									$.wicallbacks[funcname](result);
								}else{
									sz.commons.CheckSaved.getInstance().setModified();
									window.location.reload();
								}
							}});
						}
					}
				});
			}
		});
	},
	
	addCallbacks : function(key, func){
		var callbacks = $.wicallbacks;
		if(!callbacks){
			$.wicallbacks = callbacks = {};
		}
		callbacks[key] = func;
	}
});

/**
**  在初始化表单的时候执行的通用事件，在起草的时候添加“送审”和“临时保存按钮”
**
***/
function oninitwiform($flow){
	hiddenButtons($flow);
	
	/**
	 * 忽略修改未保存提示，在IE8下打开一个合同表单后，每次切换，都有提示，特别繁琐。
	 */
	sz.commons.CheckSaved.getInstance().setIgnore(true);
	
	if($flow.form && ($flow.form == "STARTFORM")){
		var form = $flow.getForm();
		var formName = form.getCurrentFormName();
		
		$flow.addButton({id:'wisubmit',caption:"送审",icon:"sz-app-icon-run",next:"cancel",click:function(event){
			$.checkSubmitAudit($flow, formName, false);	debugger;			
		}});
		$flow.addButton({id:'wisave',caption:"临时保存",icon:"sz-app-icon-save",next:"wisubmit",click:function(event){
			$.checkSubmitAudit($flow, formName, true);
		}});
		
		$.addCallbacks("submit_"+$flow.getForm().getCurrentFormName(), function(result){
			sz.commons.CheckSaved.getInstance().setModified();
			if(window.parent && $(window.parent.document).find("iframe").length>0){
				var instid = result != null ? result["instanceid"] : "";
				var wiresid  = $flow.resid;
				var calcParams = "$instid="+instid+"&$wiresid="+wiresid;
				var dlgParams = {title:"提示",width:500,height:300,showfoot:false};
				var url = "/meta/LAWCONT/analyses/maintain/index_report/hintinfo?$sys_calcnow=true&$sys_disableCache=true&$sys_showCaptionPanel=false&$sys_showParamPanel=false&"+calcParams;
				sz.law.showReportDlg(url, dlgParams);
			}
		});
	}
	
	/**
	 * 重载点击事件，点击的时候直接预览内容
	 */
	if($flow.form){
		var form = $flow.getForm().getCurrentForm();
		sz.ci.custom.uploadattachment.refactorAllAttachmentClick(form);
	}
				   
	if (typeof(window._hzinitformcallback) == "function"){
		window._hzinitformcallback($flow)		   
	}
}

function hiddenButtons($flow){
	var buttons = [];
	if($flow.form && ($flow.form == "STARTFORM" || $flow.form == "MAINTAIN")){
		buttons.push("complete");
	}else{
		buttons.push("return");			   
	}
	
	buttons.push("save");
	/**
	 * 在回退后的界面，点击返回按钮，导致界面死掉，原因是该界面是从iframe打开的，并且也不需要回退，故隐藏
	 */
	if($flow._getBaseParams){
		var params = $flow._getBaseParams();
		if(params && params["instanceid"] && params["taskid"]){
			buttons.push("return");
		}
	}
	
	hiddenWIButtons($flow, buttons);
}

/**
** 在“维护“的界面提供”增加“和”删除“按钮
**/
function oninitwiquery($flow){
	var buttons = ['start'];
	hiddenWIButtons($flow, buttons);
	
	if(($flow.form && ($flow.form == "MAINTAIN")) || ($flow.query && ($flow.query == "MAINTAIN"))){
		$flow.addButton({id:'wiadd',caption:"增加",icon:"sz-app-icon-add2",next:"deletedata",click:function(event){
			$flow.showForm({resid:$flow.resid,alias : "STARTFORM"});         
		}});
	}
};

function hiddenWIButtons($flow, buttons){
	$.each(buttons, function(){
		var btn = $flow.getButton(this); 
		if(btn){
			btn.setVisible(false);
     	}	
	})
}

/**
 * @createdate 2014-10-10
 * @author wangyg
 * 
 * 本脚本主要是处理范本拷贝，在业务中表现在点击选择合同范本，然后会出现范本选择界面，在界面中点击一行来选择，之后把选择的范本内容和名称插入到当前的
 * 表单中
 */
(function($){
	var hzutils = sz.sys.namespace("sz.ci.custom.hzutils");
	hzutils.removeTextLink = function($dom,textids){
		if (textids){
			for (var i=0;i<textids.length;i++){
				var id = textids[i];
				var dom = $("#"+id,$dom);
				if (dom){
					var text = dom.text();
					var aDom = dom.find("a");
					if(aDom){
						aDom.remove();
						dom.text(text).css("color","black").css("text-decoration" , "none");
					}
				}
			}
		};
	}
	
 	var upload = sz.sys.namespace("sz.ci.custom.uploadattachment");
 	
 	upload.WORD_URL = "/meta/LAWCONT/others/word/wordedit.action";
 	upload.SHOWFILE = "/meta/LAWCONT/others/word/showfile.action";
	
	/**
	 *	范本引入
	 */
	upload.uploadAndEditContractByModel = function($form, compid,callback,noNeedEdit) {
		var compObj = $form.getComponent(compid);
		var val = compObj.getAttachmentValue();
		if (val != null){
			upload.makeTemplateContract($form, compid, callback);
			/*
			 * upload.editAttachmentAsDoc($form, compid);
			 */
			return;
		}
		
		var uid = $form.getComponent("fb_uid").val();
		var data = {
			resid		        : 'LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/LC_CONT_INFO',
			dataperiod		  : "",
			datahierarchies	: "",
			formName		    : $form.getFormName(),
			compid		      : compid,
			compress		    : false,
			ciattachment		: {
				taskid			     : "LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/HTFBGL",
				formset			     : "default",
				dataperiod			 : "",
				datahierarchies		: "",
				uid : uid,
				rowkey : "",
				dwTable			     : "FM_TPL_INFO",
				fileContentField	: "ATTACHMENT1",
				fileNameField			: "FN0"
			},
			formdatas : JSON.stringify(upload.getFillFormDatas($form)),
			success		      : function(info) {
				var newInfo = $form.getFormData().getAttachment(compid);
				compObj.setAttachmentValue(newInfo);
				/*在表单初始化的时候，如果用范本起草合同，那么只需要将合同初始化进去即可，不需要在线编辑，所以这里加上一个参数noNeedEdit*/
				if(!noNeedEdit){
					upload.editAttachmentAsDoc($form, compid,callback);
				}
			}
		};
	
		var $fillforms = $form.getFillForms();
		var datamgr    = $fillforms.getDataMgr();
		/**
		 * 重载保存草稿的功能，从范本
		 */
		if(!datamgr.oldAjax){
			datamgr.oldAjax = datamgr.ajax;
		
			datamgr.ajax = function(args){
				/**
				 * sz.sys.ctx("/cifill/uploadAttachment2")
				 */
				var url = args.url;
				
				if(url == sz.sys.ctx("/cifill/uploadAttachment2")){
					args.url = sz.sys.ctx(upload.WORD_URL+"?method=saveDraft");
					args.data.path = args.data.resid;
					datamgr.oldAjax(args);
				}else{
					datamgr.oldAjax(args);
				}
			}
		}
		
		$fillforms.uploadAttachment(data);
	}
	
	/**
	 * 编辑表单中的word文件
	 * sz.ci.custom.uploadattachment.editAttachmentAsDoc($form, "htwb");
	 */
	upload.editAttachmentAsDoc = function($form, compid,callback){
		var htwb = $form.getComponent(compid);

		if(!htwb.oldGetAttachmentValue){
			htwb.oldGetAttachmentValue = htwb.getAttachmentValue;
		
			htwb.getAttachmentValue=function(){
				var attachmentInf = htwb.oldGetAttachmentValue();
				if(!attachmentInf){
					return null;
				}
				
				attachmentInf.url = upload.refactorAttachmentUrl("downloadFormWord", attachmentInf.url);
				if(!attachmentInf.name){
					attachmentInf.name = "word.doc";
				}
				/**
				 * attachmentInf.name = "word.doc";
				 */
				return attachmentInf;
			}
		}
		
		if(!htwb.oldEditAttachmentAsDoc){
			htwb.oldEditAttachmentAsDoc = htwb.editAttachmentAsDoc;
			
			htwb.editAttachmentAsDoc = function(params){
				htwb.editAttachmentAs(function(args) {
				    var nmspace = sz.utils.guid("sz.ci.editattachment.");
				    var nmspaceObj = sz.sys.namespace(nmspace);
				    /**
				     * 20141104 guob
				     * ISSUE:LAWCONT-38
				     * 问题现象：在调用cifillforms的editAttachmentAsDoc方法时设置的回调函数initPlugin不起作用
				     * 问题原因：editAttachmentAsDoc方法中没有设置参数，导致外面传入的回调函数不起作用
				     * 解决方案：editAttachmentAsDoc方法支持设置参数并将该参数合并到已有的参数中，这样外部传入的
				     * 回调函数就可以正常使用了
				     */
				    var success = params && params.success;
				    var nargs = $.extend({}, params, args);
				    
				    nmspaceObj.getOpenUrl = function() {
					    return nargs.url;
				    }
				    nmspaceObj.getSaveArgs = function() {
				    	var save = nargs.save;
				    	save.url = sz.sys.ctx(upload.WORD_URL+"?method=saveWordInForm");
						if(!save["path"]){
							save["path"] = save.resid;
							save.resid = null;
							delete save.resid;
						}
						
					    return save;
				    }
				    nmspaceObj.getArgs = function() {
					    return nargs;
				    }
				    nmspaceObj.getFileName = function() {
					    return nargs.filename;
				    }
				    nmspaceObj.success = function(info) {
					    nargs.success(JSON.parse(info));
					    success && success();
				    }
				    /**
				     * window.open(sz.sys.ctx("/wsoffice/edit?namespace=" + nmspace));
				     */
				    window.open(sz.sys.ctx(upload.WORD_URL+"?namespace=" + nmspace));
			    });
			}
		}
		
		htwb.editAttachmentAsDoc(callback);
	}
	
	
	upload.getFillFormDatas = function($form){
		var allcompdatas = $form.getFormData()["componentsdata"];
		var compdatas = $.grep(allcompdatas, function(n, i){
			return n && n.compinf && n.compinf.dbfield;
		})
		var result = {};
		for(var i=0; compdatas && i<compdatas.length; i++){
			var compData = compdatas[i];
			var vv = compData.getSubmitValue();
			result[compData.compinf.dbfield] = vv;
		}
		return result;
	}
	
	/**
	 * 生成范本合同：
	 *   1.如果表单里面还没有合同，那么直接取出范本，根据表单字段生成并存储到草稿中
	 *   2.如果存在合同，那么最开始应该从合同表单里面取出，在存储的草稿中
	 *   3.如果存在合同，并且在草稿中，那么就从草稿中重新取出合同
	 */
	upload.makeTemplateContract = function($form, compid, callback, noNeedEdit){
		var compObj = $form.getComponent(compid);
		var attachmentVal = compObj.getAttachmentValue();
		if (attachmentVal != null){
			/**
			 * 2、3 从表单或者草稿中取出合同
			 * TODO
			 */
			var data = {
				formdatas:JSON.stringify(upload.getFillFormDatas($form)),
				formName		    : $form.getFormName(),
				compid		      : compid
			};
			
			var url = upload.refactorAttachmentUrl("makecontract", attachmentVal.url);
			$.post(url, data, function(info){
				compObj.setAttachmentValue(info);
			    upload.editAttachmentAsDoc($form, compid,callback);
			});
		}else{
			/**
			 * 1.从范本里面取出合同，目前打开合同，就会自动生成，这里就不用在生成合同
			 * TODO
			 */
			
		}
	}
	
	/**
	 * 重构表单中的link地址，改用脚本实现
	 */
	upload.refactorAttachmentUrl = function(method, srcUrl){
		var customUrl = sz.sys.ctx(upload.WORD_URL);
		/**
		 * /cifill/downloadAttachment?resid=18907146&id=38b59b87-5362-4424-8b51-124837a52a8d
		 * /cifill/downloadAttachment?resid=18907146&dataperiod=20141221&datahierarchies=ORG%253DtestOrg%2526UID%253D38491bcb84ee4156a67cb2a9608661e4&rowKey=&dwTable=HZ_CONT_INFO&fileContentField=HTWB&fileNameField=FN0
		 * /meta/LAWCONT/others/word/wordedit.action?method=downloadFormWord
		 * /meta/LAWCONT/others/word/wordedit.action?method=downloadFormWord&path=18907146&id=38b59b87-5362-4424-8b51-124837a52a8d
		 */
		var url = srcUrl;
		var idx = url.indexOf("?");
		url = url.substring(idx);
		var resid = sz.utils.getParameterOfUrl("resid", url);
		url = sz.utils.setParameterOfUrl("path", resid, url);
		url = customUrl+sz.utils.setParameterOfUrl("method", method, url);
		/**
		 * attachmentInf.name = "word.doc";
		 */
		return url;
	}
	
	/**
	 * 重设表单中附件的点击事件
	 */
	upload.refactorAttachmentClick = function(fileComp){
		if(!fileComp)
			return;
		
		fileComp.uploadComponent.one("clickdownload", function(event) {
			var url = fileComp.$dom.find("a[target]").attr("href");
			if (url) {
				var idx = url.indexOf("?");
				var params = url.substring(idx+1);
				var resid = sz.utils.getParameterOfUrl("resid", params);
				params += "&path="+resid;
				var openUrl = sz.sys.ctx(upload.SHOWFILE)+params;
				window.open(openUrl);
			}
			/**
			 * IE下event.preventDefault()不行，可能是上传控件
			 */
			if(window.event){
				window.event.returnValue = false;
				window.event.cancelBubble = true;
			}
			event.preventDefault();
			return false;
		});
	}
	
	/**
	 * 重设表单中附件点点击事件，便于用户点击的时候，可以在线预览，目前只支持图片、word、pdf
	 */
	upload.refactorAllAttachmentClick = function(form){
		var comps = form.$dom.find(".sz-commons-fileupload");
		comps.each(function(idx, vv){
			upload.refactorAttachmentClick($$(vv));
		})
	}
	
	/**
	 * 上传附件，抽取公用的函数
	 */
	upload.uploadFile = function(form, floatCell, attachmentField){
		var floatarea = form.getFloatArea(floatCell);
		var row = floatarea.lastRow();
		if(!row.isBlank()){
			row = floatarea.newRow();
		}
		var cicomp = row.getComponent(attachmentField);
		cicomp.getInput().uploadFile();
	}
	
	upload.REPORTDEFAULTPARAMS = {$sys_calcnow:true, $sys_disableCache:true, $sys_showCaptionPanel:false};
	
	/**
	 * 把报表显示在对话框里面，并且支持选择行，回调事件等
	 */
	upload.showReportDlg = function(rptUrl, dlgParams, callbackfunc, reportParams){
		var url = sz.sys.ctx(rptUrl);
		var newParams = dlgParams || {};
		newParams["showhelp"] = false;
			
		if(!this.reportdlg){
			this.reportdlg = sz.commons.Dialog.create(newParams);
		} 
		this.reportdlg.setParams(newParams);
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
		$.extend(datas, upload.REPORTDEFAULTPARAMS);
		
		this.reportdlg.show({
			"url":url,
			data : datas
		});
	}
	
	/**
	 * 合同编号对话框
	 */
	upload.showGCBH = function(callback){
		var dlgParams = {title:"工程编号",width:640,height:400};
		var url = "/meta/LAWCONT/analyses/pro_sys_intergartion/GCHXX";
		upload.showReportDlg(url, dlgParams, callback);
	}
	
	/**
	 * 弹出供应商对话框
	 */
	upload.showGYS = function(callback){
		var dlgParams = {title:"供应商信息",width:670,height:350};
		var url = "/meta/LAWCONT/analyses/pro_sys_intergartion/GYSXXB";
		upload.showReportDlg(url, dlgParams, callback);
	}
	
	/**
	 * 给浮动表添加一行记录
	 * url       弹出对话框报表url
	 * dlgParams 对话框大小相关参数
	 * floatCell 浮动表元名，要全部小写，弹出框点击确定时，会给表单元格设置值，例如：table5.b2
	 * selectIndex 弹出对话框报表，需要选择的列
	 */
	upload.addFloatRow = function(url, dlgParams, form, floatCell, selectIndex){
		if(!selectIndex){
			selectIndex = 0;
		}
		
		sz.law.showReportDlg(url, dlgParams, {ok:function(rpt){
			var uid = rpt.$seltable.getSelectedRowCellHint(selectIndex);
			var floatArea = form.getFloatArea(floatCell);
			var row = floatArea.lastRow();
			if(!row.isBlank()){
				row = floatArea.newRow();
			}
			var comp = row.getComponent(floatCell);
			comp.val(uid);
		}});
	}
	
	/**
	 * 上面的名字太长，下面起一个别名，以后都使用下面的函数
	 */
	sz.law = upload;
})(jQuery)

/**
 * TODO 待郭波提供查看历史审批审批的扩展点
 */
var his = $(".sz-wi-wihistory");
if(his.length>0){
	his.find("a[href^='/wiapi']").each(function(i,v){
		var obj = $(this);
		/**
		 * wiapi/attachment?id=137602
		 */
		var oldUrl = obj.attr("href"); 
		var url = sz.sys.ctx(sz.law.SHOWFILE+"?id="+sz.utils.getParameterOfUrl("id",oldUrl));
		obj.attr("href", url);
	});
}