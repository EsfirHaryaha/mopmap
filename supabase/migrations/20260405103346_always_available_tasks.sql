-- Allow task instances without a due date (always available tasks)
alter table task_instances alter column due_date drop not null;
