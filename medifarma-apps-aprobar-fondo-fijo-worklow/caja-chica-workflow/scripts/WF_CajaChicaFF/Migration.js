var migration_flag = $.context.migration_flag;

if (migration_flag === undefined) {
	$.context.migration_flag = "natural";
}

var user_task_id = $.context.user_task_id;

if (user_task_id === undefined) {
	$.context.user_task_id = "";
}