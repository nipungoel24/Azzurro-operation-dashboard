-- Process Task Audit Trigger Function
CREATE OR REPLACE FUNCTION public.process_task_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public."AuditLog" (id, task_id, task_title, action_type, changed_by_email, new_data, timestamp)
        VALUES (gen_random_uuid()::text, NEW.id, NEW.title, 'INSERT', NEW.created_by_email, to_jsonb(NEW), now());
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public."AuditLog" (id, task_id, task_title, action_type, changed_by_email, old_data, new_data, timestamp)
        VALUES (gen_random_uuid()::text, NEW.id, NEW.title, 'UPDATE', NEW.updated_by_email, to_jsonb(OLD), to_jsonb(NEW), now());
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public."AuditLog" (id, task_id, task_title, action_type, changed_by_email, old_data, timestamp)
        VALUES (gen_random_uuid()::text, OLD.id, OLD.title, 'DELETE', 'system_deleted', to_jsonb(OLD), now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Process Task Audit Trigger Binder
CREATE TRIGGER task_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public."Task"
FOR EACH ROW EXECUTE FUNCTION public.process_task_audit();
