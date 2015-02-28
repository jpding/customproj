$.extend({
     //加载一些必要的js和css文件到系统中
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
	 * 在上报时，先检查是否已经通过审核，如果没有通过则弹出审核提示信息，注意这里的“临时保存”的时候是关闭了数据审核的。
	 * isSave true|false
	 */
	 checkSubmitAudit:function($flow, formName, isSave, callback){
		
	},
	
	addCallbacks : function(key, func){
		var callbacks = $.wicallbacks;
		if(!callbacks){
			$.wicallbacks = callbacks = {};
		}
		callbacks[key] = func;
	}
});


function _doForm_SJ($flow){
	var fillForm = $flow.getForm();
	var nodealias = $flow.params.form;
	if(nodealias =="JBRQR" || nodealias =="CGYQR"){
		fillForm.datamgr.getFormsData().setModified(true);
		var completeBtn =  $flow.getButton('complete');
		if (completeBtn){
			completeBtn.setCaption("确定");
		}
		
		var rejectonestepBtn =  $flow.getButton('rejectonestep');
		if(rejectonestepBtn){
			rejectonestepBtn.setCaption("退回重审");
		}
	}
	
	if(["QHBFGLDSH","ZKJSSH","BZSH","FZJJSSH","ZJLZLSH","GSFGLDSH","GSZJLSH"].indexOf(nodealias)!=-1){
		$flow.addButton({id:'signer',caption:"电子签章",icon:"sz-app-icon-add2",next:"",click:function(event){
			var $form = $flow.getForm().getCurrentForm();
			sz.custom.uploadSQD($form,"sqdwj",{initPlugin:function(plugin){/*plugin.Toolbars=false*/}});
		}});
	}
	
	/*如果是综合类审价或者船舶物资类审价的选定供应商环节，那么需要设置表单的修改状态，并且加载审签单文件到表单中*/
	if ("XCSJJL" == nodealias || "SJH" == nodealias){
		fillForm.datamgr.getFormsData().setModified(true);
		var compid = "sqdwj";
		var curForm = $flow.getForm().getCurrentForm();
		var compObj = curForm.getComponent(compid);
		var val = compObj.getAttachmentValue();
		if (val == null){
			var uid = "XCSJJL" == nodealias ? "5ebd35ea67c34915b0d945b8ca3bacc3" : "a2c7d26415b645ad8a60b29398bb8c82";
			var resPath = "LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/SQDGL";
			sz.law.uploadTemplateContract(curForm, resPath , "HZ_SQD", "ATTACHMENT1", "FN0", uid, compid, null ,true);
		}
	}
	
	/*在分管领导审核的时候需要设置表单的修改状态默认为被修改，这样的话在用户点击批准的时候才会提示有哪些必填项没有填写*/
	if(nodealias =="FGLDSH"){
 		fillForm.datamgr.getFormsData().setModified(true);
	}
}

/**
 *	点击签章的时候，自动生成签章文件，并存储到表单的相关附件中，该函数为通用的处理函数
 */
sz.sys.namespace("sz.custom").uploadSQD = function($form, compid,callback) {
	var compObj = $form.getComponent(compid);
	var val = compObj.getAttachmentValue();
	if (val != null){
		sz.law.makeTemplateContract($form, compid,callback,true);
	}
}

function func_dofrom(){
	return this;
}

/*
	处理综合审价的浏览器特殊脚本
	1、经办人确认的时候，把按钮改成“确定”和“退回重审”
	2、在审价会通过审价之后，显示电子签章按钮
*/
func_dofrom.prototype._doForm_ZHSJ = function($flow){
	_doForm_SJ($flow);
}

func_dofrom.prototype._doForm_SJ_CBWZL = function($flow){
	_doForm_SJ($flow);
}


//func_doform.prototype._doForm_HZ_CONT_INFO = function($flow){
//	var fillForm = $flow.getForm();
//	var nodealias = $flow.params.form;
//	if( "BZSH" == nodealias){
//		fillForm.datamgr.getFormsData().setModified(true);
//		var cont_type = fillForm.getValue("CONT_SUB_TYPE");
//		var compid = "sqdwj";
//		var curForm = $flow.getForm().getCurrentForm();
//		var compObj = curForm.getComponent(compid);
//		var val = compObj.getAttachmentValue();
//		if (val == null){
//			var uid = "";
//			if ([].indexOf(cont_type)!=-1){
//				 "XCSJJL" == nodealias ? "5ebd35ea67c34915b0d945b8ca3bacc3" : "a2c7d26415b645ad8a60b29398bb8c82";
//			}
//			var resPath = "LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/SQDGL";
//			sz.law.uploadTemplateContract(curForm, resPath , "HZ_SQD", "ATTACHMENT1", "FN0", uid, compid, null ,true);
//		}
//	}
//}

/*处理授权委托中需要系统设置为默认修改的部分，在授权委托管理员审核和授权委托管理员确认环节需要处理*/
func_dofrom.prototype._doForm_AUTH_ENTR = function($flow){
	var nodealias = $flow.params.form;
	/**
		授权委托管理员需要上传文本，所以必须一开始就设置表单为修改过的状态
	**/
	if(nodealias == "SQWTGLYSH" || nodealias == "SQWTGLYQR"){
		fillForm.datamgr.getFormsData().setModified(false);
	}	
}
/**
**  在初始化表单的时候执行的通用事件，在起草的时候添加“送审”和“临时保存”按钮，并隐藏其他的按钮，在送审之后，统一弹出
* 链接中所示的报表，报表中可以查看“送审流程”等
***/
function oninitwiform($flow){
	hiddenButtons($flow);
	
	/**
	 * 忽略修改未保存提示，在IE8下打开一个合同表单后，每次切换，都有提示，特别繁琐。
	 */
	sz.commons.CheckSaved.getInstance().setIgnore(true);
	sz.commons.CheckSaved.getInstance().off();
	
	/**
	 * 重载点击事件，点击的时候直接预览内容
	 * 另外如果有别名的话，需要将别名设置进去
	 */
	if($flow.form){
		var fillForm = $flow.getForm();
		var form = $flow.getForm().getCurrentForm();
		sz.ci.custom.uploadattachment.refactorAllAttachmentClick(form);
		var formName = form.name;
		
		//如果是已经审批通过的表单，那么没必要做其他设置
		var state = fillForm.getValue("hide_status_",formName);
		if(state != '10' && state != '20') return;
		
		//如果需要设置别名，那么需要将别名设置进去，这样就避免了每个工作流上去设置一遍 ---by wangyg
		var nodeAliaObj = form.getComponent("nodealias");
		if(nodeAliaObj){
			var nodealias= $flow.params.form;
			fillForm.setValue(nodealias,"nodealias",formName.toUpperCase());
		}
		
		var formfunc = new func_dofrom();
		
		var funcName = "_doForm_"+formName;
		if(formfunc[funcName]){
			formfunc[funcName]($flow,nodealias);
		}
		
		if($flow.form == "STARTFORM"){
			_doinitwiform_STARTFORM($flow);
		}
	}
	
	
     
	/*没必要加上回调的，本身就会调用*/ 
}

function func_doStartFrom(){
	return this;
}

/**
* 处理合同送审时候的流程浏览器脚本
* 合同起草表单打开的时候需要进行的处理如下：
* 1、如果有范本，那么初始化范本ID进去
* 2、如果有审价，那么初始化审价ID进去
* 3、
*/
func_doStartFrom.prototype._doStartForm_HZ_CONT_INFO = function($flow){
	/*
	  如果将合同保存成草稿，那么合同就有了businesskey，此时不该再做其他操作
	  例如，用范本起草合同的时候，会通过URL传输一个范本UID进来，而保存草稿之后
	  再通过草稿起草，URL里面就没有范本UID了，会造成系统误判为非范本合同
	*/
	if (!$flow.businesskey){
		var utils = sz.utils;
		var fb_uid = utils.getParameter("fb_uid");
		var sjuid = utils.getParameter("sjuid");
		var gcbh = utils.getParameter("gcbh");
		var fillforms = $flow.getForm();
		if (fb_uid && fb_uid != ""){
			fillforms.setValue(fb_uid,"fb_uid","HZ_CONT_INFO");
			fillforms.setValue("1","iscontractmodel","HZ_CONT_INFO");
			
			//初始化范本进去
			if(sz.ci && sz.ci.custom && sz.ci.custom.uploadattachment){
				var curForm = $flow.getForm().getCurrentForm();
				sz.ci.custom.uploadattachment.uploadAndEditContractByModel(curForm, "htwb",null,true)
			}
		}else{
			fillforms.setValue("0","iscontractmodel","HZ_CONT_INFO");
		};	
		
		//初始化审价id进去
		if(sjuid){
			var curForm = $flow.getForm().getCurrentForm();
			setTimeout(function(){
				var curForm = $flow.getForm().getCurrentForm();
				curForm.getComponent("sj_uid").val(sjuid);
				fillforms.setValue(gcbh,"proj_num","HZ_CONT_INFO");
			},500)	
		};
	}
	
	/*
		替代掉以前的保存回调机制，这里保存之后要打开合同草稿箱，如果没有覆盖，那么刷新的是本页面。
	*/
	$.addCallbacks("save_"+$flow.getForm().getCurrentFormName(), function(){
		sz.commons.CheckSaved.getInstance().setModified();
		if(window.parent && $(window.parent.document).find("iframe").length>0){
			var url = sz.sys.ctx("/meta/LAWCONT/analyses/index/newhome/showcontent.action?path=269582365&form=MAINTAIN")
			window.parent.navTab.openTab("custom_24",url ,{title:"合同草稿箱", fresh:true, external:true})
		}
	});
}


/*处理合同签订表单的起草事件，需要做如下处理：
1：只显示提交按钮，因为合同签订是事后登记，内容也较少，不需要临时保存
2：要把关联合同的uid传入到合同签订里面去
3、在提交之后关闭页面
*/
func_doStartFrom.prototype._doStartForm_FM_CONT_SIGN = function($flow){	
	if (!$flow.businesskey){
		var utils = sz.utils;
		var cont_uid = utils.getParameter("cont_uid");
		var fillforms = $flow.getForm();
		fillforms.setValue(cont_uid,"cont_uid","FM_CONT_SIGN");
	}
	
	sz.commons.CheckSaved.getInstance().off();	
	$.addCallbacks("save_"+$flow.getForm().getCurrentFormName(), function(result){
		sz.commons.Alert({msg:"操作成功",onok:function(){
			if(top && top.navTab){
				top.navTab.closeCurrentTab();
			}
		}})
	});
}

/*规章制度立项的时候需要添加规章制度，添加规章制度的对话框需要关闭，这里需要留下关闭的接口
*/
func_doStartFrom.prototype._doStartForm_BMJHZD = function($flow){
	var topDlg = sz.commons.DialogMgr.getTopDlg();
	if(topDlg){
		$.addCallbacks("save_"+$flow.getForm().getCurrentFormName(), function(){
			topDlg.lastForm = $flow.getForm();
			if(sz.custom.wi.on_callback){
				sz.custom.wi.on_callback();
			}
			topDlg.close();
		});
	}
	
	var  returnBtn = $flow.getButton('return');
	if(returnBtn){
		returnBtn.setVisible(false);
	}
}

/*登记外聘律师的时候需要把提交改为入库，这样更加符合使用的场景*/
func_doStartFrom.prototype._doStartForm_LC_REGI_INFO = function($flow){
	var submitBtn = $flow.getButton("wisubmit");
	if(submitBtn){
		submitBtn.setCaption("入库");
	}
	
	$.addCallbacks("submit_LC_REGI_INFO", function(result){
		sz.commons.Confirm.show({msg:"成功入库",onok:function(){
				if(top && top.navTab){
				 top.navTab.closeCurrentTab();
				}
			},oncancel:function(){
				if(top && top.navTab){
				 top.navTab.closeCurrentTab();
				}
			}
		});						  
	});
}

/*
	授权委托管理员审核流程中，在授权委托管理员上传授权委托书和授权委托管理员确认环节需要设置
	表单为修改过的状态。
*/
func_doStartFrom.prototype._doForm_AUTH_ENTR = function($flow){
	var nodealias = $flow.params.form;
	/**
		授权委托管理员需要上传文本，所以必须一开始就设置表单为修改过的状态
	**/
	if(nodealias == "SQWTGLYSH" || nodealias == "SQWTGLYQR"){
		fillForm.datamgr.getFormsData().setModified(false);
	}	
}

/*在表单初始化的时候，做的一些处理,之所以不再各个流程中去写，是为了统一管理，减少脚本量*/
function _doinitwiform_STARTFORM($flow){
	var form = $flow.getForm();
	var formName = form.getCurrentFormName();

	//先调用各个流程的特殊客户端脚本,然后增加相应的按钮
	var formFunc = new func_doStartFrom();
	var funcName = "_doStartForm_"+formName;
	if (formFunc[funcName]){
		formFunc[funcName]($flow);
	}
	
	
	var fillforms = $flow.getForm();
	var dataMgr = fillforms.datamgr;
	/*该保存会进行数据审核，适用于那些不需要审核，只是简单入库的表单，例如“范本”，“资信库”等,用于对话框的时候，可以关闭对话框*/
	if (["FM_TPL_INFO","FM_CASE_EXEC","LC_CASE_RESU","LC_CONT_ARCH","FM_CONT_EVAL","FM_CONT_SIGN"].indexOf(formName)!=-1){
		$flow.addButton({id:'cisave',caption:"保存",icon:"sz-app-icon-save",next:"cancel",click:function(event){
			fillforms.endEdit({
				success:function(){
					dataMgr.audit({success:function(){
						if (dataMgr.getFormsData().getFailAuditsCount() > 0) {
							fillforms.showAuditResults();
							return ;
						}
						fillforms.submit({success:function(submitArgs,instArgs){
							if($flow.wiformparams && $flow.wiformparams.openmode == "dialog"){
								if(sz.custom && sz.custom.wi && sz.custom.wi.on_callback){
									sz.commons.CheckSaved.getInstance().setModified();
									sz.custom.wi.saveFormCallback();
								}
							}else{
								sz.commons.CheckSaved.getInstance().setModified();
								window.location.reload();
							}
						}});
					}
					});
				}
			});	
		}});
		return;
	}
		
	/*送审的时候会检查数据有效性，如果有对话框，会触发对话框的回调事件*/
	$flow.addButton({id:'wisubmit',caption:"送审",icon:"sz-app-icon-run",next:"cancel",click:function(event){
		fillforms.endEdit({
			success:function(){
				dataMgr.audit({success:function(){
					var failLen = fillforms.getAllFailAuditResult().length;
					if(failLen > 0){
						fillforms.showAuditResults();
						return;
					}
					$flow.startFlow({datas:{"dim":"value"},success:function(args, result){
						var funcname = "submit_"+formName;
						if($flow.wiformparams && $flow.wiformparams.openmode == "dialog"){
							if(sz.custom && sz.custom.wi && sz.custom.wi.on_submitcallback){
								sz.commons.CheckSaved.getInstance().setModified();
								sz.custom.wi.submitFormCallback();
							}
						}else{	
							if($.wicallbacks && $.wicallbacks["submit_"+formName]){
								$.wicallbacks[funcname](result);
							}else{
								sz.commons.CheckSaved.getInstance().setModified();
								window.location.reload();
						}}
					}});
				}});
			}
		});		
	}});
	
	/*
	 * 有些方法是在对话框中处理的，不需要临时保存，用户只需要直接上报提交审批即可，类似的方法例如：合同解除、合同变更，合同履行
	*/
	if (["FM_CONT_RELIEVE","FM_CONT_CHANGE","FM_CONT_PERFORM"].indexOf(formName)==-1){
		/*临时保存只是存储为草稿，不会检查数据的有效性*/
		$flow.addButton({id:'wisave',caption:"临时保存",icon:"sz-app-icon-save",next:"wisubmit",click:function(event){
			fillforms.endEdit({
				success:function(){
					dataMgr.audit({success:function(){
						fillforms.submit({hint:false,nodata:"true",submiterrorlevels:["checkkeyunique"],success:function(submitArgs,instArgs){
							var funcname = "save_"+formName;
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
					}});
				}
			});	
		}});
	}
	
	//提交之后的默认回调函数，默认显示送审成功的对话框
	$.addCallbacks("submit_"+formName, function(result){
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

/*在送审的界面和维护节点需要隐藏完成按钮，其他节点中需要隐藏返回按钮，保存按钮都不需要*/
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
		upload.uploadTemplateContract($form, "LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/HTFBGL", "FM_TPL_INFO", "ATTACHMENT1", "FN0", uid, compid, callback, noNeedEdit);
		
		/*
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
				// 在表单初始化的时候，如果用范本起草合同，那么只需要将合同初始化进去即可，不需要在线编辑，所以这里加上一个参数noNeedEdit
				if(!noNeedEdit){
					upload.editAttachmentAsDoc($form, compid,callback);
				}
			}
		};
	
		var $fillforms = $form.getFillForms();
		var datamgr    = $fillforms.getDataMgr();
		//重载保存草稿的功能，从范本
		if(!datamgr.oldAjax){
			datamgr.oldAjax = datamgr.ajax;
		
			datamgr.ajax = function(args){
				// sz.sys.ctx("/cifill/uploadAttachment2")
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
		*/
	}
	
	/**
	 * 编辑表单中的word文件
	 * sz.ci.custom.uploadattachment.editAttachmentAsDoc($form, "htwb");
	 */
	upload.editAttachmentAsDoc = function($form, compid,callback, exParams , isSigner){
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
				 * 在下载word时，加入一些特殊的参数，
				 * 例如：
				 */
				if(exParams){
					var url = attachmentInf.url;
					for(var pkey in exParams){
						url = upload.setParameterOfUrl(pkey, exParams[pkey], url);
					}
					attachmentInf.url = url;
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
				    var nmspace = sz.utils.guid("sz.ci.editattachment.");debugger;
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
				    	/**
				    	 * cifillforms.editAttachmentAs会设置附件的信息，由于这里不会总是返回附件的内容，故这里要判断，只有返回的是
				    	 * 附件的信息时，那么才进行设置，判断返回值含有id，那么就有附件信息，就进行设置
				    	 */
				    	var attaInfo = JSON.parse(info);
				    	if(attaInfo && attaInfo.id){
				    		nargs.success(attaInfo);
				    	}
					    success && success();
				    }
				    /**
				     * window.open(sz.sys.ctx("/wsoffice/edit?namespace=" + nmspace));
				     */
					if(isSigner == true){
						window.open(sz.sys.ctx(upload.WORD_URL+"?namespace=" + nmspace + "&signature=true"));
					}else{
				   		window.open(sz.sys.ctx(upload.WORD_URL+"?namespace=" + nmspace));
					}
			    });
			}
		}
		
		htwb.editAttachmentAsDoc(callback);
	}
	
	/**
	 * 2015-2-5 对于浮动表的数据，以这种形式加入
	 * table1_a2:xxx;table1_b2...
	 * table1_a3:xxx;table1_b3...
	 * 便于生成范本，不自动根据浮动表生成
	 */
	upload.getFillFormDatas = function($form){
		var allcompdatas = $form.getFormData()["componentsdata"];
		var compdatas = $.grep(allcompdatas, function(n, i){
			return n && n.compinf && n.compinf.dbfield;
		})
		var result = {};
		for(var i=0; compdatas && i<compdatas.length; i++){
			var compData = compdatas[i];
			var vv = compData.getTxt(); //获取到的value不是想要的，例如，供应商可能获取到的供应商代码
			result[compData.compinf.dbfield] = vv;
		}
		/**
		 * 加入浮动表格的数据
		 */
		var floatareas = $form.getFormData().floatareas;
		for(var i=0; floatareas && i<floatareas.length; i++){
			var farea = floatareas[i];
			upload.getFillFormDatas_floatAreas(farea, result);
		}
		return result;
	}
	
	upload.getFillFormDatas_floatAreas = function(floatarea, result){
		var rows = floatarea.getVisibleRows();
		for(var i=0; rows && i<rows.length; i++){
			var row = rows[i];
			var datas = row.getComponentDatas();
			for(var j=0; datas && j<datas.length; j++){
				var data = datas[j];
				if(data && data.compinf &&  data.compinf.name){
					var cellName = data.compinf.name.replaceAll(/\./,'_');
					var realName = cellName.substring(0, (cellName.length-1))+(parseInt(cellName.charAt(cellName.length-1))+i);
					var vv = data.getTxt();
					result[realName.toUpperCase()] = vv;
				}
			}
		}
	}
	
	/**
	 * 生成范本合同：
	 *   1.如果表单里面还没有合同，那么直接取出范本，根据表单字段生成并存储到草稿中
	 *   2.如果存在合同，那么最开始应该从合同表单里面取出，在存储的草稿中
	 *   3.如果存在合同，并且在草稿中，那么就从草稿中重新取出合同
	 */
	upload.makeTemplateContract = function($form, compid, callback, isSigner){
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
				debugger;
				/**
				 * 2015-2-6
				 * 以前只考虑了起草状态下的，根据范本生成合同文本，而电子签章是直接根据表单里面的附件直接
				 * 生成，如果服务器端返回的是空，那么就不设置附件信息，因为表单上附件本来就有，故不用再次生成
				 */
				if(info){
					compObj.setAttachmentValue(info);
				};
			    upload.editAttachmentAsDoc($form, compid,callback,null,isSigner);
			});
		}else{
			/**
			 * 1.从范本里面取出合同，目前打开合同，就会自动生成，这里就不用在生成合同
			 * TODO
			 */
		}
	}
	
	/**
	 * 上传范本合同，用于范本草稿还没生成时使用，会直接从范本库的范本拷贝到当前表单中
	 * 范本相关参数
	 * t_resid:
	 * t_dwTable:
	 * t_fileContentField:
	 * t_fieldNameField:
	 * compid:范本待保存的控件id
	 */
	upload.uploadTemplateContract = function($form, t_resid, t_dwTable, t_fileContentField, t_filedNameField, t_uid, compid, callback, noNeedEdit){
		var $fillforms = $form.getFillForms();
		var resid = $fillforms.resid;
		var data = {
			resid		        : resid,
			dataperiod		  : "",
			datahierarchies	: "",
			formName		    : $form.getFormName(),
			compid		      : compid,
			compress		    : false,
			ciattachment		: {
				taskid			     : t_resid,
				formset			     : "default",
				dataperiod			 : "",
				datahierarchies		: "",
				uid : t_uid,
				rowkey : "",
				dwTable			     : t_dwTable,
				fileContentField	: t_fileContentField,
				fileNameField			: t_filedNameField
			},
			formdatas : JSON.stringify(upload.getFillFormDatas($form)),
			success		      : function(info) {
				var newInfo = $form.getFormData().getAttachment(compid);
				var compObj = $form.getComponent(compid);
				compObj.setAttachmentValue(newInfo);
				/*在表单初始化的时候，如果用范本起草合同，那么只需要将合同初始化进去即可，不需要在线编辑，所以这里加上一个参数noNeedEdit*/
				if(!noNeedEdit){
					upload.editAttachmentAsDoc($form, compid,callback);
				}
			}
		};
	
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
	 * 重构链接，往链接里面设置一个参数，或者修改一个参数的值
	 */
	upload.setParameterOfUrl = function(key, value, url){
		var idx = url.indexOf("?");
		var perfix = url.substring(0, idx);
		var mUrl = url.substring(idx);
		return perfix+sz.utils.setParameterOfUrl(key, value, mUrl);
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
				var openUrl = sz.sys.ctx(upload.SHOWFILE+"?")+params;
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
		/**
		 * 由于上传的文件要在线打开，故在浮动表中添加附件，要监听生成link事件
		 */
		var fileInput = cicomp.getInput(); 
		upload.refactorAttachmentClick(fileInput);
		fileInput.uploadFile();
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
	var prefix = sz.sys.ctx('/wiapi');
	his.find("a[href^='"+prefix+"']").each(function(i,v){
		var obj = $(this);
		/**
		 * wiapi/attachment?id=137602
		 */
		var oldUrl = obj.attr("href"); 
		var url = sz.sys.ctx(sz.law.SHOWFILE+"?id="+sz.utils.getParameterOfUrl("id",oldUrl));
		obj.attr("href", url);
	});
}