var url = sz.sys.ctx('/meta/LAWCONT/others/law.js');
var uid = $form.getComponent("uid").val()
$.getScript(url, function(){
	var formdata = {"rure_uid":uid,'inplan':'0',title:"添加关联制度",hiddenbutton:['wisubmit']};
	var currentForm = $form;
	sz.custom.wi.addFormData("LAWCONT:/workflows/HD_PROJECT/HDGZL_GZZD/GZZDLX",formdata,800,480,function(){
		var topDlg = sz.commons.DialogMgr.getTopDlg();
		var fillforms = topDlg.lastForm;

		var form = fillforms.getForm("HD_GZZD"); 
		var zdId = form.getComponent("uid").val();
		
		var floatArea = currentForm.getFloatArea("table2.b2");
		var row = floatArea.lastRow();
		if(!row.isBlank()){
			row = floatArea.newRow();
		}
		var comp = row.getComponent("table2.b2");
		comp.val(zdId);
	});
});


//=======================
alert($component.getRow().getComponent("table2.b2").val()+"aa"+$component.getRow().getComponent("table2.c2").val())

var row = $component.getRow();
var uid = row.getComponent("table2.b2").val();
var org = row.getComponent("table2.c2").val();
var zdmc = row.getComponent("table2.d2").val();
var url=sz.sys.ctx("/citask/databrowser?resid=LAWCONT:/collections/HD_PROJECT/HDBD_GZZD/HD_GZZD&ci_datahierarchies=ORG="+org+"=UID="+uid+"&$sys_ci_onlyforms=true&ci_readonly=true");
top.navTab.openTab("forminfoReadonly",url ,{title:zdmc, fresh:true, external:true})