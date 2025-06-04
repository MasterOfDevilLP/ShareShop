BEGIN;
	-- fix items wgid fk
	ALTER TABLE items DROP CONSTRAINT items_wgid_fkey;
	ALTER TABLE items ADD FOREIGN KEY (wgid) REFERENCES wg(wgid) ON DELETE CASCADE;

	-- fix shoppinglists wgid fk
	ALTER TABLE shoppinglists DROP CONSTRAINT shoppinglists_wgid_fkey;
	ALTER TABLE shoppinglists ADD FOREIGN KEY (wgid) REFERENCES wg(wgid) ON DELETE CASCADE;

	-- fix users wgid fk
	ALTER TABLE users DROP CONSTRAINT users_wgid_fkey;
	ALTER TABLE users ADD FOREIGN KEY (wgid) REFERENCES wg(wgid) ON DELETE SET NULL;
	
	-- fix itemchanges itemid fk
	ALTER TABLE itemchanges DROP CONSTRAINT itemchanges_itemid_fkey;
	ALTER TABLE itemchanges ADD FOREIGN KEY (itemid) REFERENCES items(itemid) ON DELETE CASCADE;

	-- fix listchanges shoppinglistid fk
	ALTER TABLE listchanges DROP CONSTRAINT listchanges_shoppinglistid_fkey;
	ALTER TABLE listchanges ADD FOREIGN KEY (shoppinglistid) REFERENCES shoppinglists(shoppinglistid) ON DELETE CASCADE;


	-- fix itemallocation itemid fk
	ALTER TABLE itemallocation DROP CONSTRAINT itemallocation_itemid_fkey;
	ALTER TABLE itemallocation ADD FOREIGN KEY (itemid) REFERENCES items(itemid) ON DELETE CASCADE;

	-- fix itemallocation shoppinglistid fk
	ALTER TABLE itemallocation DROP CONSTRAINT itemallocation_shoppinglistid_fkey;
	ALTER TABLE itemallocation ADD FOREIGN KEY (shoppinglistid) REFERENCES shoppinglists(shoppinglistid) ON DELETE CASCADE;
COMMIT;