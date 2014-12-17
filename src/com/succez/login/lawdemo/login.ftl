<@sz.commons.dynamicImport depends="sz.commons.browserChecker,sz.commons.html,sz.commons.form,sz.commons.form.captcha,sz.bi.login,sz.thirdpart.hammer"/>
<@sz.commons.html.simplehtml title="">
<link rel="stylesheet" href="index.css" type="text/css" media="screen"/>
<@sz.commons.browserChecker/>
<div class="page_login">
	<div class="header"></div>
	<div class="section">
		<div class="section_inner">
			<div id="login-status"></div>
			<div id="role-caption">法务人员(FW)</div>
			<div class="login_form">
				<div class="box_l">
					<form action="">
						<div  class="form_layout">
							<table border="0" cellpadding="0" cellspacing="0" style="position:relative;top:18px;">
								<tr>
									<td><@sz.commons.form.input name="user" placeholder="用户名"/></td>
								</tr>
								<tr>
									<td><@sz.commons.form.password name="password" placeholder="密码"/></td>
								</tr>
								<tr>
									<td><@sz.commons.form.captcha name="captcha" placeholder="验证码"/></td>
								</tr>
								<tr>
									<td><span class="remember-ctrl">
										<@sz.commons.form.checkbox name="remember" label="记住我的登录状态"/>
										</span></td>
								</tr>
								<tr>
									<td><button id="login-btn" type="button">登录</button></td>
								</tr>
							</table>
						</div>
					</form>
				</div>
				<div class="box_line"></div>
				<div class="box_r">
					<div class="banner_panel">
						<a href="#" class="banner">
							审批职责
							<p class="banner_desc">对合同和规章制度的管控点执行审批</p>
						</a>
						<a href="#" class="banner">
							风险控制
							<p class="banner_desc">有效预防和控制法律风险</p>
						</a>
						<a href="#" class="banner">
							知识库维护
							<p class="banner_desc">维护法律知识库支持管控点风险控制</p>
						</a>
					</div>
				</div>
			</div>
			
			<#-- 设置背景图片，便于响应鼠标响应事件 -->
			<div>
				<table id="__01" width="313" height="284" border="0" cellpadding="0" cellspacing="0" style="background-color:red;">
					<tr>
						<td align="left" valign="top">
							<img src="img/t2_01.jpg" width="95" height="72" alt=""></td>
						<td colspan="2" rowspan="2" align="left" valign="top">
							<img src="img/t2_02.jpg" width="120" height="83" alt=""></td>
						<td rowspan="2" align="left" valign="top">
							<img src="img/t2_03.jpg" width="97" height="83" alt=""></td>
						<td>
							<img src="img/spacer.gif" width="1" height="72" alt=""></td>
					</tr>
					<tr>
						<td rowspan="2" align="left" valign="top">
							<img src="img/t2_04.jpg" width="95" height="85" alt=""></td>
						<td>
							<img src="img/spacer.gif" width="1" height="11" alt=""></td>
					</tr>
					<tr>
						<td colspan="3">
							<img src="img/t2_05.jpg" width="217" height="74" alt=""></td>
						<td>
							<img src="img/spacer.gif" width="1" height="74" alt=""></td>
					</tr>
					<tr>
						<td colspan="2" align="left" valign="top">
							<img src="img/t2_06.jpg" width="96" height="126" alt=""></td>
						<td colspan="2">
							<img src="img/t2_07.jpg" width="216" height="126" alt=""></td>
						<td>
							<img src="img/spacer.gif" width="1" height="126" alt=""></td>
					</tr>
					<tr>
						<td>
							<img src="img/spacer.gif" width="95" height="1" alt=""></td>
						<td>
							<img src="img/spacer.gif" width="1" height="1" alt=""></td>
						<td>
							<img src="img/spacer.gif" width="119" height="1" alt=""></td>
						<td>
							<img src="img/spacer.gif" width="97" height="1" alt=""></td>
						<td></td>
					</tr>
				</table>
			</div>
			
			<div class="themes_nav">
				<a href="#" id="prev-theme" title="上一张" style="display:none;"></a>
				<a href="#" id="next-theme" title="下一张" style="display:none;"></a>
			</div>
			<div class="section_footer">
				<span class="copyright">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					健全法务管理体系&nbsp;&nbsp;规避企业法律风险&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;　　　　　&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;推荐分辨率:1366x768</span>
				
			</div>
		</div>
	</div>
	<div class="footer"></div>
</div>
<@script src="index.js"/>
<@script>
	sz.bi.Login.createDefault();
</@script>
</@sz.commons.html.simplehtml>