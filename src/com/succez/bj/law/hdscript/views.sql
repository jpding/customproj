Create View v_act_hi_comment As Select * From act_hi_comment;
Create View v_act_hi_taskinst As Select * From act_hi_taskinst;
Create View v_act_re_procdef As Select * From act_re_procdef;
Create View v_act_hi_procinst As Select * From act_hi_procinst;
Create View v_act_hi_actinst As Select * From act_hi_actinst;
Create View v_act_ru_task As Select * From act_ru_task;
Create View v_act_hi_varinst As Select * From act_hi_varinst;
Create View v_act_hi_attachment As Select * From act_hi_attachment;

create view v_act_ru_form_name as
Select t.proc_inst_id_, t.name_, t.text_  From ACT_RU_VARIABLE t Where t.name_ In

('CONT_NAME', 'PROJ_NAME', 'JHZDMC, CASE_NAME', 'BID_NAME_','CONTRACT_NAME','NAME')
;

create view v_act_hi_form_name as
Select t.proc_inst_id_, t.name_ , t.text_  From act_hi_varinst t
Where t.name_ In
 ('CONT_NAME','CONTRACT_NAME', 'PROJ_NAME', 'JHZDMC, CASE_NAME', 'BID_NAME_','NAME')
;

CREATE VIEW v_act_push_task
AS
SELECT t0.ID_ AS TASK_ID_
	,t0.PROC_DEF_ID_
	,t0.PROC_INST_ID_
	,t0.CREATE_TIME_ AS CREATE_TIME_
	,t0.NAME_ AS TACHENAME_
	,t0.ASSIGNEE_ AS ASSIGNEE_
	,t1.TEXT_ AS STARTER_
FROM ACT_RU_TASK t0
INNER JOIN act_hi_varinst t1 ON (t1.PROC_INST_ID_ = t0.PROC_INST_ID_)
WHERE (t1.NAME_ = 'starter')
 ;
 
create View v_act_busi_pro as select t0.ID_ AS task_id,t0.PROC_DEF_ID_ AS PROC_DEF_ID_,t1.BUSINESS_KEY_ AS UID,t0.PROC_INST_ID_ AS PROC_INST_ID_,t0.ASSIGNEE_ as ASSIGNEE_ from (act_ru_task t0 join act_ru_execution t1 on((t0.EXECUTION_ID_ = t1.ID_)));
 
create View v_audit_price_view As
SELECT t0.UID AS UID,t0.NAME AS NAME,t0.XDGYS AS XDGYS,t0.ZZCJJ AS ZZCJJ  from hz_zhsj_zhsj t0
UNION
SELECT t1.UID AS UID,t1.NAME AS NAME,t1.XDGYS AS XDGYS,t1.ZZCJJ AS ZZCJJ  from  wzsj_sj_cbwzl t1;

create View v_negotiate_view As
SELECT t0.UID AS UID,t0.BID_NAME_ AS NAME,t0.BID_AMOUNT AS PRI_AMOUNT,t0.NEGO_TYPE AS NEGO_TYPE FROM LC_BID1_FM_LC_CONT_BID1 t0
UNION
SELECT t1.UID AS UID,t1.BID_NAME_ AS NAME,t1.BID_AMOUNT AS PRI_AMOUNT,t1.NEGO_TYPE AS NEGO_TYPE FROM LC_BID2_LC_CONT_BID2 t1
UNION
SELECT t2.UID AS UID,t2.NAME AS NAME,t2.BID_AMOUNT AS PRI_AMOUNT,t2.NEGO_TYPE AS NEGO_TYPE FROM QTTPXX_OTHER_TP t2;



Create View v_act_hi_comment_rel As select t0.*,t1.BUSINESS_KEY_ as UID from act_hi_comment t0 left join  act_hi_procinst t1 on t0.PROC_INST_ID_=t1.PROC_INST_ID_;