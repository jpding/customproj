<#--
@depends sz.commons.browserChecker,sz.commons.html,sz.commons.form,sz.commons.form.captcha,sz.bi.login
-->
<@sz.commons.html.simplehtml title="上海卫生综合业务分析系统">
<#--<@sz.commons.browserChecker/>-->
<style>
body {
	background: #DAE8F3;
}
.page {
	width: 100%;
	height: 100%;
	position: relative;
	background: transparent url(images/login_bg_04.jpg) repeat-x left center;
}
.box {
	position: absolute;
	left: 50%;
	top: 50%;
	width: 1280px;
	height: 650px;
	margin: -325px 0 0 -640px;
}
.box_col {
	position: relative;
	height: 650px;
	display: block;
	float: left;
}
.box_lcol {
	width: 429px;
}
.box_ccol {
	width: 444px;
}
.box_rcol {
	width: 407px;
}
.login_lt {
	background: transparent url(images/login_01.jpg) no-repeat;
	width: 429px;
	height: 180px;
}
.login_lm {
	background: transparent url(images/login_04.jpg) no-repeat;
	width: 429px;
	height: 265px;
}
.login_lb {
	background: transparent url(images/login_07.jpg) no-repeat;
	width: 429px;
	height: 205px;
}
.login_ct {
	background: transparent url(images/login_02.jpg) no-repeat;
	width: 444px;
	height: 180px;
}
.login_cm {
	background: transparent url(images/login_05.jpg) no-repeat;
	width: 444px;
	height: 265px;
}
.login_cb {
	background: transparent url(images/login_08.jpg) no-repeat;
	width: 444px;
	height: 205px;
}
.login_rt {
	background: transparent url(images/login_03.jpg) no-repeat;
	width: 407px;
	height: 180px;
}
.login_rm {
	background: transparent url(images/login_06.jpg) no-repeat;
	width: 407px;
	height: 265px;
}
.login_rb {
	background: transparent url(images/login_09.jpg) no-repeat;
	width: 407px;
	height: 205px;
}
.login-form table {
	position: relative;
	width: 320px;
	left: 50%;
	top: 8px;
	margin: 0 0 0 -160px;
}
.login-form table .caption {
	text-align: right;
	white-space: nowrap;
	padding: 9px 12px 0 0;
	height: 40px;
}
.login-form table .caption div {
	text-align: right;
	white-space: nowrap;
	font-size: 14px;
	font-family: "Lucida Grande", "Lucida Sans Unicode", "LiHei Pro Medium", "Apple LiGothic Medium", "Microsoft YaHei", Helvetica, Arial, Verdana, sans-serif;
	height: 40px;
	line-height: 40px;
	position: relative;
	top: -9px;
}
.remember-ctrl {
	font-size: 14px;
	font-family: "Lucida Grande", "Lucida Sans Unicode", "LiHei Pro Medium", "Apple LiGothic Medium", "Microsoft YaHei", Helvetica, Arial, Verdana, sans-serif;
	text-align: right;
	white-space: nowrap;
	padding: 9px 12px 9px 0;
}
.user-bg, .password-bg {
	width: 270px;
	height: 40px;
}
.user-bg input, .password-bg input {
	border: 1px solid #999;
	background: transparent;
	padding: 10px 4px;
	width: 250px;
	height: auto;
	margin: -8px 0 0 10px;
	outline: none;
}
.captcha-bg {
}
.captcha-bg .sz-commons-form-captcha {
	width: 110px;
	height: 40px;
}
.captcha-bg .sz-commons-form-captcha .captcha-caption {
	position: absolute;
	left: -54px;
	top: 12px;
	font-size: 14px;
}
.captcha-bg .sz-commons-form-captcha>input[type="captcha"] {
	border: 1px solid #999;
	background: transparent;
	padding: 10px 4px;
	width: 90px;
	margin: 6px 0 0 10px;
	outline: none;
	float: left;
}
.captcha-bg .sz-commons-form-captcha>.sz-commons-captcha {
	position: absolute;
	left: 115px;
	top: 5px;
}
#login-btn {
	background: #182eb7;
	height: 35px;
	line-height: 35px;
	padding: 0 24px;
	color: #fff;
	border: none;
}
#login-status {
	height: 34px;
	padding: 9px 0;
}
/*--//ChromeFrame Checker--*/
.sz-commons-browserChecker-CFInstall {
  line-height: 20px;
  font-size: 12px;
  font-weight: normal;
  font-family: "Lucida Grande", "Lucida Sans Unicode", "LiHei Pro Medium", "Apple LiGothic Medium", "Microsoft YaHei", Helvetica, Arial, Verdana, sans-serif;
  width: 100%;
  background: #F76527;
  display: none;
  position: absolute;
  top: 0;
  z-index: 9;
}
.sz-commons-browserChecker-CFInstall.activate {
  background: #C6E725;
}
.sz-commons-browserChecker-CFInstall span.activate {
  display: none;
}
.sz-commons-browserChecker-CFInstall span {
  display: inline-block;
  margin: 0 4px;
  padding: 6px 4px;
}
.sz-commons-browserChecker-CFInstall span a:link,
.sz-commons-browserChecker-CFInstall span a:active,
.sz-commons-browserChecker-CFInstall span a:visited,
.sz-commons-browserChecker-CFInstall span a:hover {
  margin: 0 2px;
  color: #0000ff;
}
/*--//ChromeFrame Checker--*/

</style>
<div class="page">
	<div class="box">
		<div class="box_col box_lcol">
			<div class="login_lt"></div>
			<div class="login_lm"></div>
			<div class="login_lb"></div>
		</div>
		<div class="box_col box_ccol">
			<div class="login_ct"></div>
			<div class="login_cm login-form">
				<table border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td colspan="2"><div id="login-status"></div></td>
					</tr>
					<tr>
						<td class="caption"><div>用户名</div></td>
						<td class="user-bg"><@sz.commons.form.input name="user"/></td>
					</tr>
					<tr>
						<td class="caption"><div>密码</div></td>
						<td class="password-bg"><@sz.commons.form.password name="password"/></td>
					</tr>
					<tr>
						<td><div></div></td>
						<td class="captcha-bg"><@sz.commons.form.captcha name="captcha"><div class="captcha-caption">验证码</div></@sz.commons.form.captcha></td>
					</tr>
					<tr>
						<td>&nbsp;</td>
						<td style="text-align:right;padding: 0 4px"><span class="remember-ctrl">
							<@sz.commons.form.checkbox name="remember" label="记住密码"/>
							</span>
							<button type="button" id="login-btn">登录</button></td>
					</tr>
				</table>
			</div>
			<div class="login_cb"></div>
		</div>
		<div class="box_col box_rcol">
			<div class="login_rt"></div>
			<div class="login_rm"></div>
			<div class="login_rb"></div>
		</div>
	</div>
</div>
<@script src="cfchecker.js"/>
<@script>
sz.bi.Login.createDefault();
</@script>
</@sz.commons.html.simplehtml>