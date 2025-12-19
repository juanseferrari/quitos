-- Add RLS policies for the new tables
-- Execute this in Supabase SQL Editor

-- Policies for game_moves
CREATE POLICY "Users can view own game moves" 
ON public.game_moves FOR SELECT 
TO authenticated
USING (game_id IN (
    SELECT id FROM public.games 
    WHERE user_id IN (
        SELECT id FROM public.users 
        WHERE auth_uid = auth.uid()::text
    )
));

CREATE POLICY "Users can insert own game moves" 
ON public.game_moves FOR INSERT 
TO authenticated
WITH CHECK (game_id IN (
    SELECT id FROM public.games 
    WHERE user_id IN (
        SELECT id FROM public.users 
        WHERE auth_uid = auth.uid()::text
    )
));

-- Policies for data_migrations  
CREATE POLICY "Users can view own migrations" 
ON public.data_migrations FOR SELECT 
TO authenticated
USING (user_id IN (
    SELECT id FROM public.users 
    WHERE auth_uid = auth.uid()::text
));

CREATE POLICY "Users can insert own migrations" 
ON public.data_migrations FOR INSERT 
TO authenticated
WITH CHECK (user_id IN (
    SELECT id FROM public.users 
    WHERE auth_uid = auth.uid()::text
));