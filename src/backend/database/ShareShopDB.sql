--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)

-- Started on 2025-05-21 15:25:47 CEST

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
-- TOC entry 858 (class 1247 OID 16416)
-- Name: changeenum; Type: TYPE; Schema: public; Owner: modfurry
--

CREATE TYPE public.changeenum AS ENUM (
    'ADDED',
    'REMOVED',
    'EDITED'
);


ALTER TYPE public.changeenum OWNER TO modfurry;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16410)
-- Name: itemallocation; Type: TABLE; Schema: public; Owner: modfurry
--

CREATE TABLE public.itemallocation (
    itemid character(8) NOT NULL,
    shoppinglistid character(8) NOT NULL,
    creationdate date NOT NULL,
    amount integer NOT NULL
);


ALTER TABLE public.itemallocation OWNER TO modfurry;

--
-- TOC entry 220 (class 1259 OID 16423)
-- Name: itemchanges; Type: TABLE; Schema: public; Owner: modfurry
--

CREATE TABLE public.itemchanges (
    itemid character(8) NOT NULL,
    itemchangeid integer NOT NULL,
    change public.changeenum NOT NULL,
    changedate date NOT NULL
);


ALTER TABLE public.itemchanges OWNER TO modfurry;

--
-- TOC entry 217 (class 1259 OID 16400)
-- Name: items; Type: TABLE; Schema: public; Owner: modfurry
--

CREATE TABLE public.items (
    itemid character(8) NOT NULL,
    wgid character(8) NOT NULL,
    lastcachedchangeid integer,
    itemname character varying(25),
    itemdescription character varying(100),
    price money
);


ALTER TABLE public.items OWNER TO modfurry;

--
-- TOC entry 221 (class 1259 OID 16428)
-- Name: listchanges; Type: TABLE; Schema: public; Owner: modfurry
--

CREATE TABLE public.listchanges (
    shoppinglistid character(8) NOT NULL,
    listchangeid integer NOT NULL,
    change public.changeenum NOT NULL,
    changedate date NOT NULL,
    itemid character(8) NOT NULL
);


ALTER TABLE public.listchanges OWNER TO modfurry;

--
-- TOC entry 218 (class 1259 OID 16405)
-- Name: shoppinglists; Type: TABLE; Schema: public; Owner: modfurry
--

CREATE TABLE public.shoppinglists (
    shoppinglistid character(8) NOT NULL,
    wgid character(8) NOT NULL,
    lastcachedchangeid integer,
    creatoruserid character(8),
    creationdate date NOT NULL
);


ALTER TABLE public.shoppinglists OWNER TO modfurry;

--
-- TOC entry 215 (class 1259 OID 16390)
-- Name: users; Type: TABLE; Schema: public; Owner: modfurry
--

CREATE TABLE public.users (
    userid character(8) NOT NULL,
    wgid character(8),
    firstname character varying(16) NOT NULL,
    lastname character varying(16) NOT NULL,
    email character varying(50) NOT NULL,
    pwd character varying(128) NOT NULL
);


ALTER TABLE public.users OWNER TO modfurry;

--
-- TOC entry 216 (class 1259 OID 16395)
-- Name: wg; Type: TABLE; Schema: public; Owner: modfurry
--

CREATE TABLE public.wg (
    wgid character(8) NOT NULL,
    wgname character varying(16) NOT NULL,
    creationdate date NOT NULL
);


ALTER TABLE public.wg OWNER TO modfurry;

--
-- TOC entry 3492 (class 0 OID 16410)
-- Dependencies: 219
-- Data for Name: itemallocation; Type: TABLE DATA; Schema: public; Owner: modfurry
--

COPY public.itemallocation (itemid, shoppinglistid, creationdate, amount) FROM stdin;
\.


--
-- TOC entry 3493 (class 0 OID 16423)
-- Dependencies: 220
-- Data for Name: itemchanges; Type: TABLE DATA; Schema: public; Owner: modfurry
--

COPY public.itemchanges (itemid, itemchangeid, change, changedate) FROM stdin;
00000001	1	ADDED	2025-05-21
00000002	1	ADDED	2025-05-21
\.


--
-- TOC entry 3490 (class 0 OID 16400)
-- Dependencies: 217
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: modfurry
--

COPY public.items (itemid, wgid, lastcachedchangeid, itemname, itemdescription, price) FROM stdin;
00000001	00000001	1	testitem	\N	\N
00000002	00000001	1	testitem2	\N	\N
\.


--
-- TOC entry 3494 (class 0 OID 16428)
-- Dependencies: 221
-- Data for Name: listchanges; Type: TABLE DATA; Schema: public; Owner: modfurry
--

COPY public.listchanges (shoppinglistid, listchangeid, change, changedate, itemid) FROM stdin;
\.


--
-- TOC entry 3491 (class 0 OID 16405)
-- Dependencies: 218
-- Data for Name: shoppinglists; Type: TABLE DATA; Schema: public; Owner: modfurry
--

COPY public.shoppinglists (shoppinglistid, wgid, lastcachedchangeid, creatoruserid, creationdate) FROM stdin;
\.


--
-- TOC entry 3488 (class 0 OID 16390)
-- Dependencies: 215
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: modfurry
--

COPY public.users (userid, wgid, firstname, lastname, email, pwd) FROM stdin;
\.


--
-- TOC entry 3489 (class 0 OID 16395)
-- Dependencies: 216
-- Data for Name: wg; Type: TABLE DATA; Schema: public; Owner: modfurry
--

COPY public.wg (wgid, wgname, creationdate) FROM stdin;
00000001	testwg	2025-05-21
\.


--
-- TOC entry 3332 (class 2606 OID 16414)
-- Name: itemallocation itemallocation_pkey; Type: CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.itemallocation
    ADD CONSTRAINT itemallocation_pkey PRIMARY KEY (itemid, shoppinglistid);


--
-- TOC entry 3334 (class 2606 OID 16427)
-- Name: itemchanges itemchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.itemchanges
    ADD CONSTRAINT itemchanges_pkey PRIMARY KEY (itemid, itemchangeid);


--
-- TOC entry 3328 (class 2606 OID 16404)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (itemid);


--
-- TOC entry 3336 (class 2606 OID 16432)
-- Name: listchanges listchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.listchanges
    ADD CONSTRAINT listchanges_pkey PRIMARY KEY (shoppinglistid, listchangeid);


--
-- TOC entry 3330 (class 2606 OID 16409)
-- Name: shoppinglists shoppinglist_pkey; Type: CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.shoppinglists
    ADD CONSTRAINT shoppinglist_pkey PRIMARY KEY (shoppinglistid);


--
-- TOC entry 3324 (class 2606 OID 16394)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- TOC entry 3326 (class 2606 OID 16399)
-- Name: wg wg_pkey; Type: CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.wg
    ADD CONSTRAINT wg_pkey PRIMARY KEY (wgid);


--
-- TOC entry 3340 (class 2606 OID 16498)
-- Name: itemallocation itemallocation_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.itemallocation
    ADD CONSTRAINT itemallocation_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid);


--
-- TOC entry 3341 (class 2606 OID 16503)
-- Name: itemallocation itemallocation_shoppinglistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.itemallocation
    ADD CONSTRAINT itemallocation_shoppinglistid_fkey FOREIGN KEY (shoppinglistid) REFERENCES public.shoppinglists(shoppinglistid);


--
-- TOC entry 3342 (class 2606 OID 16483)
-- Name: itemchanges itemchanges_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.itemchanges
    ADD CONSTRAINT itemchanges_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid);


--
-- TOC entry 3338 (class 2606 OID 16473)
-- Name: items items_wgid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid);


--
-- TOC entry 3343 (class 2606 OID 16493)
-- Name: listchanges listchanges_itemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.listchanges
    ADD CONSTRAINT listchanges_itemid_fkey FOREIGN KEY (itemid) REFERENCES public.items(itemid);


--
-- TOC entry 3344 (class 2606 OID 16488)
-- Name: listchanges listchanges_shoppinglistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.listchanges
    ADD CONSTRAINT listchanges_shoppinglistid_fkey FOREIGN KEY (shoppinglistid) REFERENCES public.shoppinglists(shoppinglistid);


--
-- TOC entry 3339 (class 2606 OID 16478)
-- Name: shoppinglists shoppinglists_wgid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.shoppinglists
    ADD CONSTRAINT shoppinglists_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid);


--
-- TOC entry 3337 (class 2606 OID 16468)
-- Name: users users_wgid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: modfurry
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_wgid_fkey FOREIGN KEY (wgid) REFERENCES public.wg(wgid);


-- Completed on 2025-05-21 15:25:47 CEST

--
-- PostgreSQL database dump complete
--

