--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

-- Started on 2025-06-06 15:03:41 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 846 (class 1247 OID 16707)
-- Name: changeenum; Type: TYPE; Schema: public; Owner: backendusr
--

CREATE TYPE public.changeenum AS ENUM (
    'ADDED',
    'REMOVED',
    'EDITED',
    'CREATED',
    'DELETED'
);


ALTER TYPE public.changeenum OWNER TO backendusr;

--
-- TOC entry 849 (class 1247 OID 16718)
-- Name: columnchangeenum; Type: TYPE; Schema: public; Owner: backendusr
--

CREATE TYPE public.columnchangeenum AS ENUM (
    'ITEMNAME',
    'ITEMDESCR',
    'ITEMPRICE'
);


ALTER TYPE public.columnchangeenum OWNER TO backendusr;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16725)
-- Name: itemallocation; Type: TABLE; Schema: public; Owner: backendusr
--

CREATE TABLE public.itemallocation (
    itemid uuid NOT NULL,
    shoppinglistid uuid NOT NULL,
    creationdate date NOT NULL,
    amount integer NOT NULL
);


ALTER TABLE public.itemallocation OWNER TO backendusr;

--
-- TOC entry 216 (class 1259 OID 16728)
-- Name: itemchanges; Type: TABLE; Schema: public; Owner: backendusr
--

CREATE TABLE public.itemchanges (
    itemid uuid NOT NULL,
    itemchangeid integer NOT NULL,
    change public.changeenum NOT NULL,
    changedate date NOT NULL,
    columnchange public.columnchangeenum,
    itemname character varying(25),
    itemdescription character varying(100),
    price money
);


ALTER TABLE public.itemchanges OWNER TO backendusr;

--
-- TOC entry 217 (class 1259 OID 16731)
-- Name: items; Type: TABLE; Schema: public; Owner: backendusr
--

CREATE TABLE public.items (
    itemid uuid DEFAULT gen_random_uuid() NOT NULL,
    wgid uuid NOT NULL,
    lastcachedchangeid integer,
    itemname character varying(25),
    itemdescription character varying(100),
    price money
);


ALTER TABLE public.items OWNER TO backendusr;

--
-- TOC entry 218 (class 1259 OID 16735)
-- Name: listchanges; Type: TABLE; Schema: public; Owner: backendusr
--

CREATE TABLE public.listchanges (
    shoppinglistid uuid NOT NULL,
    listchangeid integer NOT NULL,
    change public.changeenum NOT NULL,
    changedate date NOT NULL,
    itemid uuid,
    listname character varying(25),
    amount integer,
    userid uuid NOT NULL,
    price money
);


ALTER TABLE public.listchanges OWNER TO backendusr;

--
-- TOC entry 219 (class 1259 OID 16738)
-- Name: shoppinglists; Type: TABLE; Schema: public; Owner: backendusr
--

CREATE TABLE public.shoppinglists (
    shoppinglistid uuid DEFAULT gen_random_uuid() NOT NULL,
    wgid uuid NOT NULL,
    lastcachedchangeid integer,
    creationdate date NOT NULL,
    listname character varying(25) NOT NULL,
    creatoruserid uuid
);


ALTER TABLE public.shoppinglists OWNER TO backendusr;

--
-- TOC entry 220 (class 1259 OID 16742)
-- Name: users; Type: TABLE; Schema: public; Owner: backendusr
--

CREATE TABLE public.users (
    userid uuid DEFAULT gen_random_uuid() NOT NULL,
    wgid uuid,
    firstname character varying(16),
    lastname character varying(16),
    email character varying(50) NOT NULL UNIQUE,
    pwd character varying(128) NOT NULL
);


ALTER TABLE public.users OWNER TO backendusr;

--
-- TOC entry 221 (class 1259 OID 16746)
-- Name: wg; Type: TABLE; Schema: public; Owner: backendusr
--

CREATE TABLE public.wg (
    wgid uuid DEFAULT gen_random_uuid() NOT NULL,
    wgname character varying(16) NOT NULL,
    creationdate date NOT NULL
);


ALTER TABLE public.wg OWNER TO backendusr;

--
-- TOC entry 3495 (class 0 OID 16725)
-- Dependencies: 215
-- Data for Name: itemallocation; Type: TABLE DATA; Schema: public; Owner: backendusr
--

COPY public.itemallocation (itemid, shoppinglistid, creationdate, amount) FROM stdin;
\.


--
-- TOC entry 3496 (class 0 OID 16728)
-- Dependencies: 216
-- Data for Name: itemchanges; Type: TABLE DATA; Schema: public; Owner: backendusr
--

COPY public.itemchanges (itemid, itemchangeid, change, changedate, columnchange, itemname, itemdescription, price) FROM stdin;
\.


--
-- TOC entry 3497 (class 0 OID 16731)
-- Dependencies: 217
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: backendusr
--

COPY public.items (itemid, wgid, lastcachedchangeid, itemname, itemdescription, price) FROM stdin;
\.


--
-- TOC entry 3498 (class 0 OID 16735)
-- Dependencies: 218
-- Data for Name: listchanges; Type: TABLE DATA; Schema: public; Owner: backendusr
--

COPY public.listchanges (shoppinglistid, listchangeid, change, changedate, itemid, listname, amount, userid, price) FROM stdin;
\.


--
-- TOC entry 3499 (class 0 OID 16738)
-- Dependencies: 219
-- Data for Name: shoppinglists; Type: TABLE DATA; Schema: public; Owner: backendusr
--

COPY public.shoppinglists (shoppinglistid, wgid, lastcachedchangeid, creationdate, listname, creatoruserid) FROM stdin;
\.


--
-- TOC entry 3500 (class 0 OID 16742)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: backendusr
--

COPY public.users (userid, wgid, firstname, lastname, email, pwd) FROM stdin;
\.


--
-- TOC entry 3501 (class 0 OID 16746)
-- Dependencies: 221
-- Data for Name: wg; Type: TABLE DATA; Schema: public; Owner: backendusr
--

COPY public.wg (wgid, wgname, creationdate) FROM stdin;
8d672c35-b728-4044-a3c4-efa2761e220d	testwg	2025-05-30
\.


--
-- TOC entry 3331 (class 2606 OID 16751)
-- Name: itemallocation itemallocation_pkey; Type: CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.itemallocation
    ADD CONSTRAINT itemallocation_pkey PRIMARY KEY (itemid, shoppinglistid);


--
-- TOC entry 3333 (class 2606 OID 16753)
-- Name: itemchanges itemchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.itemchanges
    ADD CONSTRAINT itemchanges_pkey PRIMARY KEY (itemid, itemchangeid);


--
-- TOC entry 3335 (class 2606 OID 16755)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (itemid);


--
-- TOC entry 3337 (class 2606 OID 16757)
-- Name: listchanges listchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.listchanges
    ADD CONSTRAINT listchanges_pkey PRIMARY KEY (shoppinglistid, listchangeid);


--
-- TOC entry 3339 (class 2606 OID 16759)
-- Name: shoppinglists shoppinglist_pkey; Type: CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.shoppinglists
    ADD CONSTRAINT shoppinglist_pkey PRIMARY KEY (shoppinglistid);


--
-- TOC entry 3341 (class 2606 OID 16761)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- TOC entry 3343 (class 2606 OID 16763)
-- Name: wg wg_pkey; Type: CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.wg
    ADD CONSTRAINT wg_pkey PRIMARY KEY (wgid);


--
-- TOC entry 3344 (class 2606 OID 16829)
-- Name: itemallocation itemallocation_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.itemallocation
    ADD CONSTRAINT itemallocation_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid) ON DELETE CASCADE;


--
-- TOC entry 3345 (class 2606 OID 16834)
-- Name: itemallocation itemallocation_shoppinglistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.itemallocation
    ADD CONSTRAINT itemallocation_shoppinglistid_fkey FOREIGN KEY (shoppinglistid) REFERENCES public.shoppinglists(shoppinglistid) ON DELETE CASCADE;


--
-- TOC entry 3346 (class 2606 OID 16819)
-- Name: itemchanges itemchanges_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.itemchanges
    ADD CONSTRAINT itemchanges_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid) ON DELETE CASCADE;


--
-- TOC entry 3347 (class 2606 OID 16804)
-- Name: items items_wgid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid) ON DELETE CASCADE;


--
-- TOC entry 3348 (class 2606 OID 16784)
-- Name: listchanges listchanges_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.listchanges
    ADD CONSTRAINT listchanges_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid);


--
-- TOC entry 3349 (class 2606 OID 16824)
-- Name: listchanges listchanges_shoppinglistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.listchanges
    ADD CONSTRAINT listchanges_shoppinglistid_fkey FOREIGN KEY (shoppinglistid) REFERENCES public.shoppinglists(shoppinglistid) ON DELETE CASCADE;


--
-- TOC entry 3350 (class 2606 OID 16809)
-- Name: shoppinglists shoppinglists_wgid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.shoppinglists
    ADD CONSTRAINT shoppinglists_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid) ON DELETE CASCADE;


--
-- TOC entry 3351 (class 2606 OID 16814)
-- Name: users users_wgid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backendusr
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid) ON DELETE SET NULL;


-- Completed on 2025-06-06 15:03:41 CEST

--
-- PostgreSQL database dump complete
--

--
-- after changes to DB:
--

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