-- TODO: put this into ShareShopDB.sql
-- TODO: remove wgid row and constraints from ShareShopDB.sql
BEGIN;
    -- adding allocation table for user to wg
    CREATE TABLE public.userallocation {
    	userid uui NOT NULL,
    	wgid uui NOT NULL,
    };

    ALTER TABLE public.userallocation OWNER TO backendusr;
    ALTER TABLE ONLY public.userallocation
    	ADD CONSTRAINT userallocation_pkey PRIMARY KEY (userid, wgid);
    ALTER TABLE ONLY public.userallocation
    	ADD CONSTRAINT userallocation_userid_fkey FOREIGN KEY (userid) REFEREBCES public.users(userid) ON DELETE CASCADE;
    ALTER TABLE ONLY public.userallocation
    	ADD CONSTRAINT userallocation_wgid_fkey FOREIGN KEY (wgid) REFEREBCES public.wg(wgid) ON DELETE CASCADE;
    
    -- removing wgid from users table
    ALTER TABLE ONLY public.users
        DROP CONSTRAINT users_wgid_fkey;
    ALTER TABLE ONLY public.users
        DROP COLUMN wgid;
COMMIT;