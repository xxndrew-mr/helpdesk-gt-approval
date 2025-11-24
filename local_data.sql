--
-- PostgreSQL database dump
--

\restrict htLILu8IGgnczEWXp2yIerX9Lhvmm5B0sd7sqJUcOb1W7dtiCEaSkKI5kV0LkDv

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Division; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Division" VALUES (1, 'Divisi AB');
INSERT INTO public."Division" VALUES (2, 'Divisi AT');
INSERT INTO public."Division" VALUES (3, 'Divisi DC');
INSERT INTO public."Division" VALUES (4, 'Divisi PDAM');
INSERT INTO public."Division" VALUES (5, 'Divisi Operation');
INSERT INTO public."Division" VALUES (6, 'Divisi Marketing Pusat');
INSERT INTO public."Division" VALUES (7, 'Divisi Sales Operation');
INSERT INTO public."Division" VALUES (8, 'Divisi Prodev');
INSERT INTO public."Division" VALUES (9, 'Divisi Supply Chain');


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Role" VALUES (1, 'Administrator');
INSERT INTO public."Role" VALUES (2, 'Salesman');
INSERT INTO public."Role" VALUES (3, 'Agen');
INSERT INTO public."Role" VALUES (4, 'PIC OMI');
INSERT INTO public."Role" VALUES (5, 'Sales Manager');
INSERT INTO public."Role" VALUES (6, 'Acting Manager');
INSERT INTO public."Role" VALUES (7, 'Acting PIC');
INSERT INTO public."Role" VALUES (8, 'User Feedback');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."User" VALUES (1, 'Super Admin', 'admin@helpdesk.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 1, NULL, 'Active', NULL, 'admin');
INSERT INTO public."User" VALUES (2, 'Bpk. GM Operation', 'gm@op.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 6, 5, 'Active', NULL, 'gm_op');
INSERT INTO public."User" VALUES (3, 'Ibu Marketing Mgr', 'mgr@mkt.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 6, 6, 'Active', NULL, 'mkt_mgr');
INSERT INTO public."User" VALUES (4, 'Bpk. Sales Op Mgr', 'mgr@salesop.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 6, 7, 'Active', NULL, 'sales_op_mgr');
INSERT INTO public."User" VALUES (5, 'Staff Prodev', 'staff@prodev.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 7, 8, 'Active', NULL, 'staff_prodev');
INSERT INTO public."User" VALUES (6, 'Staff Supply Chain', 'staff@supply.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 7, 9, 'Active', NULL, 'staff_supply');
INSERT INTO public."User" VALUES (7, 'Staff Marketing', 'staff@mkt.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 7, 6, 'Active', NULL, 'staff_mkt');
INSERT INTO public."User" VALUES (8, 'Staff Sales Op', 'staff@salesop.com', '$2b$10$HgEugnFdsB9NZmF/Yu8YR.68v7ERO3lg1ho8ekUxVi5j1uQWDHi6y', 7, 7, 'Active', NULL, 'staff_sales_op');


--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: TicketAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: TicketDetail; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: TicketLog; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('e7276001-869e-4680-af51-cb1d0013b3d3', '9731ffbead3c6c928c79ac933f2d1121610e1fcb3691f99398358edb61e498f7', '2025-11-19 15:28:37.688443+07', '20251112083233_init_v2', NULL, NULL, '2025-11-19 15:28:37.540545+07', 1);
INSERT INTO public._prisma_migrations VALUES ('6cf4cffc-8217-443c-b8e9-e1ac759d803a', '6c36ff06fe97ae403151250a370de9dc060a0df0b49f45cfb53b3e0bfc59a9e5', '2025-11-19 15:28:37.69412+07', '20251118023922_refactor_submitter_fields', NULL, NULL, '2025-11-19 15:28:37.689227+07', 1);
INSERT INTO public._prisma_migrations VALUES ('26254efc-c024-41a2-ab83-e5edcee222b0', '3e712da8dbe578aa01ed670e335dfab1b0535384f8bfcdb605a59bd59bb121d4', '2025-11-19 15:28:37.699181+07', '20251118033313_add_user_status_soft_delete', NULL, NULL, '2025-11-19 15:28:37.695059+07', 1);
INSERT INTO public._prisma_migrations VALUES ('d65779e5-d671-429e-b3c5-2eefcb665bbc', '425583f557d47dfa40577b592f9b342b4890ee83a3fd820b5095009f49f68060', '2025-11-19 15:28:37.703874+07', '20251118065027_refactor_submitter_fields_v3', NULL, NULL, '2025-11-19 15:28:37.70021+07', 1);
INSERT INTO public._prisma_migrations VALUES ('02b7990c-a7e3-49b5-beb4-781f7b2b18e2', '47db4068da4d834ea3f78efd8cd0ec78bae8313de8eb5126a4de482bb7da29fb', '2025-11-19 15:28:37.715766+07', '20251118082428_add_pic_omi_relation', NULL, NULL, '2025-11-19 15:28:37.706455+07', 1);
INSERT INTO public._prisma_migrations VALUES ('4d475caf-f359-4526-8272-f000f02f2598', '2597b094399b31624cd2b8a111a9385bd9f0b8e5d6f09e9922f2e8f781bc9933', '2025-11-19 15:28:37.727362+07', '20251119025908_add_username_to_user', NULL, NULL, '2025-11-19 15:28:37.716398+07', 1);


--
-- Name: Division_division_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Division_division_id_seq"', 9, true);


--
-- Name: Role_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Role_role_id_seq"', 8, true);


--
-- Name: TicketAssignment_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TicketAssignment_assignment_id_seq"', 1, false);


--
-- Name: TicketLog_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TicketLog_log_id_seq"', 1, false);


--
-- Name: Ticket_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Ticket_ticket_id_seq"', 1, false);


--
-- Name: User_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_user_id_seq"', 8, true);


--
-- PostgreSQL database dump complete
--

\unrestrict htLILu8IGgnczEWXp2yIerX9Lhvmm5B0sd7sqJUcOb1W7dtiCEaSkKI5kV0LkDv

