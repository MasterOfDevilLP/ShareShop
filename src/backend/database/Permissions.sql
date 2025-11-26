BEGIN TRANSACTION;
    ALTER TABLE ONLY public.userallocation
        ADD owner_flag BOOLEAN DEFAULT false NOT NULL;
COMMIT;