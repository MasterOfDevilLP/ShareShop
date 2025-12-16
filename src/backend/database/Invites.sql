BEGIN;
        -- adding Invites Table
        CREATE TABLE public.invites (
            token uuid NOT NULL,
            wgid uuid NOT NULL,
            userid uuid,
            creationDateTime TIMESTAMP NOT NULL,
            expiryDateTime TIMESTAMP
        );

        -- adding constraints
        ALTER TABLE public.invites OWNER TO backendusr;
        ALTER TABLE ONLY public.invites
            ADD CONSTRAINT invites_pkey PRIMARY KEY (token);
        ALTER TABLE ONLY public.invites
            ADD CONSTRAINT invites_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid) ON DELETE CASCADE;
        ALTER TABLE ONLY public.invites
            ADD CONSTRAINT invites_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;
        
COMMIT;