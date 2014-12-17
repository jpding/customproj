var modelInfo = {
	3520 : {
	 	 cont_main_type : "0600",
		  cont_sub_type : "0610",
		  money_type : "fact"
	}
}

/**
* 定制开始表单的工具条按钮，显示提交和保存
*/
function oninitwiform_STARTFORM($flow){
	var utils = sz.utils;
	var fb_uid = utils.getParameter("fb_uid");
	var fillforms = $flow.getForm();
	if (fb_uid && fb_uid != ""){
		fillforms.setValue(fb_uid,"fb_uid","LC_CONTRACTINFO");
		fillforms.setValue("1","iscontractmodel","LC_CONTRACTINFO");
		
		var info = modelInfo[fb_uid];
		if (info){
			for (var name in info){
				fillforms.setValue(info[name],name,"LC_CONTRACTINFO");
			}
		}
	}else{
		fillforms.setValue("0","iscontractmodel","LC_CONTRACTINFO");
	};
	
	$.addCallbacks("save_"+$flow.getForm().getCurrentFormName(), function(){
		sz.commons.CheckSaved.getInstance().setModified();
		if(window.parent && $(window.parent.document).find("iframe").length>0){
			var url = sz.sys.ctx("/meta/LAWCONT/analyses/index/newhome/showcontent.action?path=LAWCONT:\/workflows\/\\u6CD5\\u5F8B\\u4E1A\\u52A1\\u7CFB\\u7EDF\/CONT_INFO2&form=MAINTAIN")
			window.parent.navTab.openTab("navtreedom_34",url ,{title:"合同维护", fresh:true, external:true})
		}else{
			window.location.href=sz.sys.ctx("/meta/LAWCONT/analyses/index/portal?selectedId=269582365-1");
		}
	});
	
	$.addCallbacks("submit_"+$flow.getForm().getCurrentFormName(), function(inst){
		sz.commons.CheckSaved.getInstance().setModified();
		if(window.parent && $(window.parent.document).find("iframe").length>0){
			/**
			 * var url = sz.sys.ctx("/showcontent?path=LAWCONT:%5C/workflows%5C/%5Cu6CD5%5Cu5F8B%5Cu4E1A%5Cu52A1%5Cu7CFB%5Cu7EDF%5C/CONT_INFO2&amp;form=ISUBMIT")
			 * window.parent.navTab.openTab("navtreedom_34",url ,{title:"我送审", fresh:true, external:true})
			 */
			var surl = sz.sys.ctx("/meta/LAWCONT/others/law.js");
			$.getScript(surl, function(){
				var dlgParams = {title:"提示",width:500,height:300,showfoot:false};
				var url = "/meta/LAWCONT:/analyses/maintain/home/hintinfo?$sys_calcnow=true&$sys_disableCache=true&$sys_showCaptionPanel=false&$sys_showParamPanel=false";
				sz.custom.wi.showReportDlg(url, dlgParams, {ok:function(rpt){
				}});
			});

		}else{
			window.location.href=sz.sys.ctx("/meta/LAWCONT/analyses/index/portal?selectedId=269582365-1");
		}
	});	
	
	$.loadJsCss(['/meta/LAWCONT/others/jgrowl/jquery.jgrowl.css','/meta/LAWCONT/others/jgrowl/jquery.jgrowl.js']);
} 

function oninitwiquery_MAINTAIN($flow){
	var wisave = $flow.getButton("wisave");
	if(wisave){
		wisave.visible(false);
	}
	var wisubmit = $flow.getButton("wisubmit");
	if(wisubmit){
		wisubmit.visible(false);
	}
	
}
