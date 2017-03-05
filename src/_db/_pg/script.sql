SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

CREATE TABLE crawler_act (
    crawler_id character varying(10) NOT NULL,
    act integer NOT NULL
);

CREATE TABLE hostlist (
    id integer NOT NULL,
    hostname character varying(100) NOT NULL,
    port integer NOT NULL,
    status integer NOT NULL,
    priority integer
);

CREATE TABLE hostlist_extras (
    host_id integer NOT NULL,
    max_pages integer,
    max_level integer,
    max_seconds integer,
    "max_HTTP_errors" integer,
    include_pages_regex character varying(250),
    exclude_pages_regex character varying(250)
);

CREATE SEQUENCE hostlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE hostlist_id_seq OWNED BY hostlist.id;

CREATE TABLE pages (
    id bigint NOT NULL,
    host_id integer NOT NULL,
    hostname character varying(255) NOT NULL,
    page character varying(255) NOT NULL,
    title character varying NOT NULL,
    anchor_text character varying NOT NULL,
    text text NOT NULL,
    tstext tsvector,
    cache text,
    html_md5 character varying NOT NULL,
    level integer DEFAULT 0 NOT NULL,
	date timestamp with time zone,
    etag character varying(255),
    lastmodified character varying(255),
    outdated boolean NOT NULL,
    contenttype character varying(255) NOT NULL
);

CREATE SEQUENCE pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE pages_id_seq OWNED BY pages.id;

CREATE TABLE pages_map (
    host_id bigint NOT NULL,
    page character varying NOT NULL,
    linkedhost_id bigint NOT NULL,
    linkedpage character varying NOT NULL,
    textlink character varying NOT NULL
);

ALTER TABLE ONLY hostlist ALTER COLUMN id SET DEFAULT nextval('hostlist_id_seq'::regclass);

ALTER TABLE ONLY pages ALTER COLUMN id SET DEFAULT nextval('pages_id_seq'::regclass);

ALTER TABLE ONLY crawler_act
    ADD CONSTRAINT crawler_act_pkey PRIMARY KEY (crawler_id);

ALTER TABLE ONLY hostlist_extras
    ADD CONSTRAINT hostlist_extras_pkey PRIMARY KEY (host_id);

ALTER TABLE ONLY hostlist
    ADD CONSTRAINT hostlist_pkey PRIMARY KEY (hostname);

ALTER TABLE ONLY pages_map
    ADD CONSTRAINT pages_map_pkey PRIMARY KEY (host_id, page, linkedpage, linkedhost_id);

ALTER TABLE ONLY pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);
