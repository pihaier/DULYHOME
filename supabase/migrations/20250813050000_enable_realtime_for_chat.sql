-- Enable Realtime for chat_messages table
-- This ensures that the table is added to the supabase_realtime publication

-- Check if table is already in publication, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
END $$;

-- Grant necessary permissions for realtime
GRANT USAGE ON SCHEMA realtime TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA realtime TO postgres, authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA realtime TO postgres, authenticated, anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA realtime TO postgres, authenticated, anon;

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Add a policy for realtime (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_messages' 
        AND policyname = 'Enable realtime for authenticated users'
    ) THEN
        CREATE POLICY "Enable realtime for authenticated users" ON chat_messages
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;

-- Verify the setup
SELECT 'chat_messages table added to realtime publication' AS status
WHERE EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'chat_messages'
);