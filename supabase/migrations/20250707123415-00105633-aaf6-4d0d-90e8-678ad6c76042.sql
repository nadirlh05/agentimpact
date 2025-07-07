-- Créer la table pour stocker les événements analytics
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  properties JSONB,
  session_id TEXT NOT NULL,
  user_id UUID,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_analytics_events_event ON public.analytics_events(event);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);

-- Politique RLS pour les analytics (accessible seulement aux admins)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics" 
ON public.analytics_events 
FOR SELECT 
USING (has_role('admin'::app_role));

CREATE POLICY "System can insert analytics" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Fonction pour obtenir les statistiques analytics
CREATE OR REPLACE FUNCTION public.get_analytics_stats(start_date timestamp with time zone)
RETURNS TABLE(
  total_page_views bigint,
  unique_visitors bigint,
  total_sessions bigint,
  top_pages jsonb,
  events_by_day jsonb,
  user_actions jsonb,
  performance_metrics jsonb
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total page views
    (SELECT COUNT(*) FROM public.analytics_events 
     WHERE event = 'page_view' AND created_at >= start_date) as total_page_views,
    
    -- Unique visitors
    (SELECT COUNT(DISTINCT session_id) FROM public.analytics_events 
     WHERE created_at >= start_date) as unique_visitors,
    
    -- Total sessions
    (SELECT COUNT(DISTINCT session_id) FROM public.analytics_events 
     WHERE created_at >= start_date) as total_sessions,
    
    -- Top pages
    (SELECT jsonb_agg(
      jsonb_build_object(
        'page', properties->>'path',
        'views', count
      )
    ) FROM (
      SELECT properties->>'path', COUNT(*) as count
      FROM public.analytics_events 
      WHERE event = 'page_view' AND created_at >= start_date
      GROUP BY properties->>'path'
      ORDER BY count DESC
      LIMIT 10
    ) t) as top_pages,
    
    -- Events by day
    (SELECT jsonb_agg(
      jsonb_build_object(
        'date', date,
        'events', count
      )
    ) FROM (
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM public.analytics_events 
      WHERE created_at >= start_date
      GROUP BY DATE(created_at)
      ORDER BY date
    ) t) as events_by_day,
    
    -- User actions
    (SELECT jsonb_agg(
      jsonb_build_object(
        'action', properties->>'action',
        'count', count
      )
    ) FROM (
      SELECT properties->>'action', COUNT(*) as count
      FROM public.analytics_events 
      WHERE event = 'user_action' AND created_at >= start_date
      GROUP BY properties->>'action'
      ORDER BY count DESC
      LIMIT 10
    ) t) as user_actions,
    
    -- Performance metrics
    (SELECT jsonb_build_object(
      'avg_load_time', AVG((properties->>'load_time')::numeric),
      'avg_first_paint', AVG((properties->>'first_paint')::numeric),
      'total_errors', (
        SELECT COUNT(*) FROM public.analytics_events 
        WHERE event = 'error' AND created_at >= start_date
      )
    ) FROM public.analytics_events 
    WHERE event = 'performance' AND created_at >= start_date) as performance_metrics;
END;
$$;