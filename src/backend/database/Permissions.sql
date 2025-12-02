BEGIN;
    -- adding the owner flag
    ALTER TABLE ONLY public.userallocation
        ADD owner_flag BOOLEAN DEFAULT false NOT NULL;
COMMIT;

BEGIN;
    -- making one of the users inside a wg owner
	UPDATE public.userallocation
	SET owner_flag = true
	WHERE userid IN (
		SELECT userid
		FROM (
			SELECT userid, wgid, ROW_NUMBER() OVER (PARTITION BY wgid ORDER BY joindate ASC) as rn
			FROM public.userallocation
		) AS sub
		WHERE rn = 1
	);
COMMIT;