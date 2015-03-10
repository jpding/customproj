<%@ page contentType="text/html; charset=GBK" %>
<%@ page import="java.util.*" %>
<%@ include file="../../head.inc"%>
<%
String productName = IReportServer.getInstance().getServerInfo().getProductName();
if( StrFunc.isNull(productName) )
	productName = "��ӭʹ��������������Ϣ����ֱ��ϵͳ";

String pageTitle = productName;
if(login.isLogined())
UserLoginCounter.getInstance().logout(login, login.getLoginId());
String cophyright = IReportServer.getInstance().getProperty("Copyright");
 %>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
<meta name="keywords" content="����,���ݲɼ���WEB����,����ϵͳ,�������,�����ߣ����籨�����񱨱���ȡ,��ҵ����,���ݲֿ�,�����ھ�,,��Ƭ,�п�,��ת,,B/S,Web Report,Java Report,BI,Portal,Olap,ETL,DW,Business Intelligence,Relational OLAP,Multidimensional OLAP,Hybrid OLAP">
<%String URLPath = serverPath+"oem/wsb" ;%>
<%
	boolean checkmac=StrFunc.str2boolean(IReportServer.getInstance().getProperty("checkmac"));
	String activexSecurityX=IReportServer.getInstance().getProperty("activexSecurityX");
	String activexSecurityXVer=IReportServer.getInstance().getProperty("activexSecurityXVer");
%>
<title><%=pageTitle %></title>
<link href="<%=URLPath%>/css/wtzb/style.css" rel="stylesheet" type="text/css">
<link href="<%=URLPath%>/css/wtzb/style_login.css" rel="stylesheet" type="text/css">
<script language=JavaScript src="<%=URLPath%>/js/flash_runactivecontent.js"></script>
<script language=JavaScript src="<%=serverPath%>sanlib/js/crypt/md5.js"></script>
<script src="../../sanlib/js/keys.js"></script>
<script src="../../sanlib/js/util.js"></script>
<script src="../../sanlib/js/sys.js"></script>
<script src="../../js/dialog.js"></script>
<link href="../../theme/blue/css/dialog.css" rel="stylesheet"type="text/css" />
<script language="JavaScript">
function getCookie(sName)
{
	// cookies are separated by semicolons
	var aCookie = document.cookie.split("; ");
	for (var i=0; i < aCookie.length; i++)
	{
	// a name/value pair (a crumb) is separated by an equal sign
	var aCrumb = aCookie[i].split("=");
	if (sName == aCrumb[0])
		return unescape(aCrumb[1]);
	}
	// a cookie with the requested name does not exist
	return '';
}

function loginTrim3() {   
	if(checkForm()) {
		var path = "<%=serverPath%>wsb/user.do";
		<%if(checkmac){%>
			var mac =getMacAddress();
			path=path+"?MAC="+mac;
		<%}%>
		document.loginform.action = path;
		document.loginform.submit();
	}
	return false;
}
function loginTrim() {
    if (checkForm()) {
        var loginform = document.loginform;
        var user = loginform.name.value;
        var pwd = loginform.password.value;

        var biurl = 'http://219.140.56.103:8080/meta/';
        var urs = [];
        if (user.endsWith('xnh')) { // ��ũ�������ǹ����ǻ��㵥λ��������ũ���Ż�ҳ
            urs.push('XNH/analyses/portal/portal');
        } else if (user.endsWith('jbgw')) { // ������������λ���빫�������Ż�ҳ
            urs.push('ggws/analyses/ggws');
        }

        if (urs && urs.length) {
            // urs.push('?user=', user, '&password=', pwd);
            // location.href = biurl + urs.join('');
            var ssologin = document.getElementById('ssologin');
            ssologin.src = '<%=serverPath%>wsb/user.do?cmd=login&name=' + user + '&password=' + pwd;
            ssologin.onreadystatechange = function() {
                if (ssologin.readyState === 'complete') {
                    (parent || window).location.href = biurl + urs.join('');
                }
            };
        } else {
            var path = "<%=serverPath%>wsb/user.do"; <%
            if (checkmac) { %>
                var mac = getMacAddress();
                path = path + "?MAC=" + mac; <%
            } %>
            loginform.action = path;
            loginform.submit();
        }
    }
    return false;
}


function getMacAddress(){
	return  plugin.doCommand("getmacaddress");
}

function checkForm() {
	//У��
	if(document.loginform.name.value=="") {
		alert("����д�û���!");
        document.loginform.name.focus();
		return false ;
	}	
	var value = document.loginform.password.value;
	document.loginform.password.old_value = value;
	if(!(/\{[a-z0-9]{32}\}/.test(value))) {
		document.loginform.password.value = "{" + hex_md5(value) + "}";
	}
	date = new Date();
	date.setMonth(date.getMonth()+1);
	document.cookie = "wsbLoginId" + "=" + escape(document.loginform.name.value) + "; expires=" + date.toGMTString();		
    return true ;

}
function checkKey(){       
	if(event.keyCode==13) {	   
		return loginTrim();
	}
}

var resetPwdDialog;
function showResetPwd(){
	var value = "";
	if(document.loginform.name.value != ""){
		value = document.loginform.name.value;
	}
	resetPwdDialog = Dialog.showUrlInDialog("resetPwdFromUser.jsp?userId="+value, "��������", 300, 200, null, window, null);
	resetPwdDialog.setResizable(false);
	//resetPwdDialog.hide();	
}
</script>

</head>
<body ><iframe id="ssologin" style="display:none"></iframe>
<%if(checkmac){%>		
		<object id="plugin" codebase="<%=activexSecurityX==null?(serverPath+"download/activexSecurityX.cab#1.0.0.0"):(activexSecurityX+"#version="+activexSecurityXVer)%>" classid="CLSID:465E34C8-3496-43B2-8864-8D58A3718AF6"></object>
<%}%>
<form name="loginform" method="post" onSubmit="return false;" >
<input name="cmd" type="hidden" value="login">
<!--��������-->
<div id="main">
	<div id="loginform">
  	<div id="header"></div>
    <div id="primary">
      <!--flash����-->
      <div id="bgFlash">
        <script type="text/javascript">AC_FL_RunContent( 'codebase','http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab','width','980','height','140','src','<%=URLPath%>/images/wtzb/banner','quality','high','WMode','transparent','pluginspage','http://www.macromedia.com/go/getflashplayer','movie','<%=URLPath%>/images/wtzb/banner' );</script><noscript><object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" width="1000" height="140"><param name="movie" value="<%=URLPath%>/images/wtzb/banner.swf" /><param name="quality" value="high" /><param name="WMode" value="transparent" /><embed src="<%=URLPath%>/images/wtzb/banner.swf" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="1000" height="140"></embed></object></noscript>
      </div>
      <!--flash���ֽ���-->
      <div id="formContent">
        <table id="formUser">
          <tr>
            <td class="text">�û���</td>
            <td><input id="loginInput" name="name" type="text" class="inputLogin" onKeyDown="checkKey()" ></td>
          </tr>
          <tr>
            <td class="text">���룺</td>
            <td><input id="pwdInput" name="password" type="password" class="inputLogin" value="" onKeyDown="checkKey()" >&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" style="color:#fff" class="forgetPwd" onClick="showResetPwd()" >��������?</a></td>
          </tr>
        </table>
        <div id="buttonUl">
          <img name="imageField" onClick="loginTrim()" src="<%=URLPath%>/images/wtzb/button_login.gif" alt="��¼ϵͳ">
          <img src="<%=URLPath%>/images/wtzb/button_forget.gif" onClick="window.close();"/>
        </div>
      </div>
    </div>
    <!--�ײ�����-->
    <div id="footer"><span id="setting">
      <%if(StrFunc.isNull(cophyright)){ %>����֧�֣�������������ίͳ����Ϣ����  <a href="http://www.esensoft.com.cn" target="_blank" hideFocus>�Ϲ⻪������ɷ����޹�˾</a>
      <%}else{%><%=cophyright%><%}%>
      <br /></span>
    </div>
  </div>
</div>
</form>
<script type="text/javascript">
function setLoginId(){
	var wsbLoginId = getCookie('wsbLoginId');
	document.getElementById('loginInput').value = wsbLoginId;
	if(wsbLoginId)		
		document.getElementById('pwdInput').focus();
	else
		document.getElementById('loginInput').focus();
}
setLoginId();
</script>
</body>
</html>
