BEGIN;
    -- adding allocation table for user to wg
    CREATE TABLE public.userallocation (
    	userid uuid NOT NULL,
    	wgid uuid NOT NULL,
        joindate date NOT NULL
    );

    ALTER TABLE public.userallocation OWNER TO backendusr;
    ALTER TABLE ONLY public.userallocation
    	ADD CONSTRAINT userallocation_pkey PRIMARY KEY (userid, wgid);
    ALTER TABLE ONLY public.userallocation
    	ADD CONSTRAINT userallocation_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;
    ALTER TABLE ONLY public.userallocation
    	ADD CONSTRAINT userallocation_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid) ON DELETE CASCADE;
    
    -- removing wgid from users table
    ALTER TABLE ONLY public.users
        DROP CONSTRAINT users_wgid_fkey;
    ALTER TABLE ONLY public.users
        DROP COLUMN wgid;
COMMIT;