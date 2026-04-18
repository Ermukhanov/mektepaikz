
-- Roles enum + roles table (separate, secure)
CREATE TYPE public.app_role AS ENUM ('director', 'teacher', 'staff');

-- Schools
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  telegram_chat_id TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'ru',
  qualifications TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, school_id)
);

-- has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- get_user_school helper
CREATE OR REPLACE FUNCTION public.get_user_school(_user_id UUID)
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INT,
  letter TEXT,
  total_students INT NOT NULL DEFAULT 0,
  homeroom_teacher_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedule
CREATE TABLE public.schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id),
  subject TEXT NOT NULL,
  room TEXT,
  day_of_week INT NOT NULL,
  lesson_number INT NOT NULL,
  start_time TIME,
  end_time TIME,
  substitute_teacher_id UUID REFERENCES public.profiles(id),
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  present_count INT NOT NULL DEFAULT 0,
  sick_count INT NOT NULL DEFAULT 0,
  absent_count INT NOT NULL DEFAULT 0,
  reported_by UUID REFERENCES public.profiles(id),
  source TEXT DEFAULT 'manual',
  raw_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, date)
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Incidents
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  source TEXT DEFAULT 'chat',
  raw_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages (Telegram/WhatsApp)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'telegram',
  external_chat_id TEXT,
  external_message_id TEXT,
  sender_name TEXT,
  sender_user_id UUID REFERENCES public.profiles(id),
  text TEXT,
  parsed_intent TEXT,
  parsed_data JSONB,
  ai_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge base (RAG / orders)
CREATE TABLE public.knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  doc_type TEXT,
  content TEXT NOT NULL,
  simplified_bullets JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telegram bot state
CREATE TABLE public.telegram_bot_state (
  id INT PRIMARY KEY CHECK (id = 1),
  update_offset BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.telegram_bot_state (id, update_offset) VALUES (1, 0);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _school_id UUID;
  _role public.app_role;
  _full_name TEXT;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'teacher');

  -- If school_name provided, create school; else attach to first existing
  IF NEW.raw_user_meta_data->>'school_name' IS NOT NULL THEN
    INSERT INTO public.schools (name) VALUES (NEW.raw_user_meta_data->>'school_name') RETURNING id INTO _school_id;
  ELSE
    SELECT id INTO _school_id FROM public.schools ORDER BY created_at LIMIT 1;
    IF _school_id IS NULL THEN
      INSERT INTO public.schools (name) VALUES ('Aqbobek') RETURNING id INTO _school_id;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, school_id, full_name, email, language)
  VALUES (NEW.id, _school_id, _full_name, NEW.email, COALESCE(NEW.raw_user_meta_data->>'language', 'ru'));

  INSERT INTO public.user_roles (user_id, role, school_id) VALUES (NEW.id, _role, _school_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies: school-scoped
CREATE POLICY "schools_select_own" ON public.schools FOR SELECT TO authenticated
  USING (id = public.get_user_school(auth.uid()));

CREATE POLICY "profiles_select_same_school" ON public.profiles FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "user_roles_select_own_school" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR school_id = public.get_user_school(auth.uid()));

-- Classes: all authenticated in same school can read; director can write
CREATE POLICY "classes_select" ON public.classes FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()));
CREATE POLICY "classes_director_all" ON public.classes FOR ALL TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(), 'director'));

CREATE POLICY "schedule_select" ON public.schedule_slots FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()));
CREATE POLICY "schedule_director_all" ON public.schedule_slots FOR ALL TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(), 'director'));

CREATE POLICY "attendance_select" ON public.attendance FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()));
CREATE POLICY "attendance_insert" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school(auth.uid()));

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()));
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school(auth.uid()));
CREATE POLICY "tasks_update_assignee_or_director" ON public.tasks FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR created_by = auth.uid() OR public.has_role(auth.uid(), 'director'));

CREATE POLICY "incidents_select" ON public.incidents FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()));
CREATE POLICY "incidents_insert" ON public.incidents FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school(auth.uid()));
CREATE POLICY "incidents_update" ON public.incidents FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school(auth.uid()));

CREATE POLICY "chat_select" ON public.chat_messages FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR school_id IS NULL);

CREATE POLICY "knowledge_select" ON public.knowledge_docs FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) OR school_id IS NULL);
CREATE POLICY "knowledge_director_all" ON public.knowledge_docs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'director'));

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- bot_state: no public access (only service role via edge functions)
