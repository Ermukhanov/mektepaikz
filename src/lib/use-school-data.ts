import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type ClassRow = {
  id: string;
  name: string;
  total_students: number;
  present: number;
  sick: number;
  status: "ok" | "pending";
};

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: string;
  priority: string;
  source: string | null;
  due_date: string | null;
  assignee_name?: string | null;
};

export type FeedRow = {
  id: string;
  sender_name: string | null;
  text: string | null;
  parsed_intent: string | null;
  parsed_data: Record<string, unknown> | null;
  created_at: string;
};

export type EmployeeRow = {
  id: string;
  full_name: string;
  qualifications: string[] | null;
};

export function useSchoolData() {
  const { profile, isAuthenticated } = useAuth();
  const schoolId = profile?.school_id;

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [feed, setFeed] = useState<FeedRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);

    const [classesRes, tasksRes, feedRes, empRes, attRes] = await Promise.all([
      supabase.from("classes").select("id,name,total_students").eq("school_id", schoolId).order("name"),
      supabase
        .from("tasks")
        .select("id,title,description,assigned_to,status,priority,source,due_date,profiles:assigned_to(full_name)")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("chat_messages")
        .select("id,sender_name,text,parsed_intent,parsed_data,created_at")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("profiles").select("id,full_name,qualifications").eq("school_id", schoolId),
      supabase.from("attendance").select("class_id,present_count,sick_count").eq("school_id", schoolId).eq("date", today),
    ]);

    const attMap = new Map<string, { present: number; sick: number }>();
    for (const a of attRes.data ?? []) attMap.set(a.class_id, { present: a.present_count, sick: a.sick_count });

    setClasses(
      (classesRes.data ?? []).map((c) => {
        const a = attMap.get(c.id);
        return {
          id: c.id,
          name: c.name,
          total_students: c.total_students,
          present: a?.present ?? 0,
          sick: a?.sick ?? 0,
          status: a ? "ok" : "pending",
        };
      })
    );

    setTasks(
      (tasksRes.data ?? []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        assigned_to: t.assigned_to,
        status: t.status,
        priority: t.priority,
        source: t.source,
        due_date: t.due_date,
        assignee_name: t.profiles?.full_name ?? null,
      }))
    );

    setFeed((feedRes.data ?? []) as FeedRow[]);
    setEmployees((empRes.data ?? []) as EmployeeRow[]);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    if (isAuthenticated && schoolId) fetchAll();
  }, [isAuthenticated, schoolId, fetchAll]);

  // Realtime subscriptions
  useEffect(() => {
    if (!schoolId) return;
    const ch = supabase
      .channel(`school-${schoolId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `school_id=eq.${schoolId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance", filter: `school_id=eq.${schoolId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages", filter: `school_id=eq.${schoolId}` }, fetchAll)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [schoolId, fetchAll]);

  const totalPresent = classes.reduce((a, c) => a + c.present, 0);
  const totalKids = classes.reduce((a, c) => a + c.total_students, 0);
  const attendance = totalKids ? Math.round((totalPresent / totalKids) * 100) : 0;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  return { classes, tasks, feed, employees, totalPresent, totalKids, attendance, activeTasks, loading, refresh: fetchAll };
}
